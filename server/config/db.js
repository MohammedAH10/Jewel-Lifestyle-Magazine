import mongoose from 'mongoose';
import { resolveMongoUri } from './mongoUri.js';

mongoose.plugin(function (schema) {
  schema.set('toJSON', { virtuals: true });
});

const MAX_POOL_SIZE = 5;
const SERVER_SELECTION_TIMEOUT_MS = 10000;
const CONNECT_TIMEOUT_MS = 15000;
const CONNECT_ATTEMPTS = 3;
const RETRY_BASE_MS = 500;

let connectPromise = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const attemptConnect = async (uri, dbName, attempt = 1) => {
  try {
    return await mongoose.connect(uri, {
      // Passed explicitly so the target database can never depend on the URI
      // happening to contain a path.
      dbName,
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
      socketTimeoutMS: 20000,
      maxPoolSize: MAX_POOL_SIZE,
      minPoolSize: 0,
      maxIdleTimeMS: 15000,
      retryWrites: true,
    });
  } catch (err) {
    if (attempt >= CONNECT_ATTEMPTS) throw err;
    const wait = RETRY_BASE_MS * 2 ** (attempt - 1);
    console.warn(
      `MongoDB connect attempt ${attempt}/${CONNECT_ATTEMPTS} failed (${err.message}); retrying in ${wait}ms`
    );
    await sleep(wait);
    return attemptConnect(uri, attempt + 1);
  }
};

/**
 * Resolves with an open connection, reusing the in-flight attempt when one is
 * already running. A cold Atlas cluster (M0 pauses when idle) often needs a
 * retry, and Vercel reuses the module across invocations while Mongo reaps
 * idle sockets, so the connection is always re-checked rather than cached in
 * a boolean flag.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (connectPromise) return connectPromise;

  // Throws if the URI does not name a database, rather than defaulting to
  // the `test` database and writing production traffic there.
  const { uri, dbName } = resolveMongoUri();

  connectPromise = attemptConnect(uri, dbName)
    .then((m) => {
      connectPromise = null;
      return m.connection;
    })
    .catch((err) => {
      connectPromise = null;
      throw err;
    });

  return connectPromise;
};

mongoose.connection.on('disconnected', () => {
  connectPromise = null;
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
  connectPromise = null;
});

export default connectDB;
/**
 * Resolves the Mongo connection string and refuses ambiguous ones.
 *
 * A Mongo connection string without a database path is valid, and both the
 * driver and mongoose quietly fall back to a database literally named `test`.
 * That is how a deployment ended up writing votes and categories to the test
 * database while the real data sat untouched in `jewel-magazine`.
 *
 * Every entry point goes through here so a missing database name fails loudly
 * at boot, instead of quietly writing production traffic somewhere else.
 */

/** The database name encoded in a Mongo URI, or null if there is none. */
export const databaseNameFromUri = (uri) => {
  if (!uri) return null;
  // Strip the scheme, then drop anything after the authority.
  const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  const afterHost = withoutScheme.slice(withoutScheme.indexOf('@') + 1);
  const path = afterHost.split('?')[0];
  // The driver ignores empty path segments, so `host//db` still means `db`.
  const segments = path.split('/').filter(Boolean);
  const name = segments[1];
  return name ? decodeURIComponent(name) : null;
};

/**
 * @param {string} [fallback] used when MONGODB_URI is not set at all, for local
 *   development defaults that already name a database.
 * @returns {{ uri: string, dbName: string }}
 */
export const resolveMongoUri = (fallback = 'mongodb://localhost:27017/jewel-magazine') => {
  const uri = process.env.MONGODB_URI || fallback;
  // MONGODB_DB lets the database be set independently of the URI.
  const dbName = databaseNameFromUri(uri) || process.env.MONGODB_DB || null;

  if (!dbName) {
    throw new Error(
      'MONGODB_URI does not name a database. Without one, MongoDB silently ' +
      'uses a database called "test" and every write lands there instead of ' +
      'the real data.\n' +
      `Add the database to the URI, e.g. mongodb+srv://user:pass@cluster/jewel-magazine?retryWrites=true&w=majority\n` +
      'or set MONGODB_DB=jewel-magazine alongside it.'
    );
  }

  return { uri, dbName };
};

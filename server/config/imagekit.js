const UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';

const isConfigured = () =>
  Boolean(
    process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_URL_ENDPOINT
  );

const requireConfig = () => {
  if (!isConfigured()) {
    const err = new Error(
      'ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.'
    );
    err.statusCode = 503;
    throw err;
  }
};

/**
 * Uploads a buffer to ImageKit and returns the CDN URL.
 */
const uploadBuffer = async (buffer, { fileName, folder } = {}) => {
  requireConfig();

  const body = new FormData();
  body.append('file', new Blob([buffer]), fileName || `upload-${Date.now()}.jpg`);
  body.append('useUniqueFileName', 'true');
  if (folder) body.append('folder', folder);

  const auth = Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString('base64');

  const res = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}` },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    const err = new Error(`ImageKit upload failed (${res.status})${detail ? `: ${detail}` : ''}`);
    err.statusCode = 502;
    throw err;
  }

  const data = await res.json();
  return data.url;
};

/**
 * Uploads a `data:image/...;base64,...` string to ImageKit and returns the CDN URL.
 */
const uploadDataUrl = async (dataUrl, options = {}) => {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new Error('uploadDataUrl expects a data URL string');
  }
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/s);
  if (!match) throw new Error('Malformed data URL');
  const [, mime, base64] = match;
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  return uploadBuffer(Buffer.from(base64, 'base64'), {
    fileName: options.fileName || `migrated-${Date.now()}.${ext}`,
    folder: options.folder,
  });
};

/**
 * Fetches a remote image and re-uploads it to ImageKit.
 */
const migrateRemoteUrl = async (remoteUrl, options = {}) => {
  const src = await fetch(remoteUrl);
  if (!src.ok) throw new Error(`Source fetch failed (${src.status}) for ${remoteUrl}`);
  const type = src.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await src.arrayBuffer());
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  return uploadBuffer(buf, {
    fileName: options.fileName || `migrated-${Date.now()}.${ext}`,
    folder: options.folder,
  });
};

export default { isConfigured, uploadBuffer, uploadDataUrl, migrateRemoteUrl };
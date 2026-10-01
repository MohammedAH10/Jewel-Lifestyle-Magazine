/**
 * Image URL helpers.
 *
 * Images are stored on ImageKit as plain URLs. Requesting an original 1920x1920
 * PNG can cost several megabytes per image, so these helpers append an
 * ImageKit transformation to fetch a right-sized, compressed variant instead.
 */

const isImageKitUrl = (url) =>
  typeof url === 'string' && url.includes('ik.imagekit.io/');

/**
 * Returns `url` with an ImageKit transformation appended.
 *
 * Non-ImageKit URLs (external links, placeholders, data URLs) are returned
 * unchanged so nothing breaks if a legacy record still points elsewhere.
 *
 * @param {string} url          original image URL
 * @param {object} [options]
 * @param {number} [options.width]           target width in px
 * @param {number} [options.height]          target height in px
 * @param {number} [options.quality=70]       compression quality (1-100)
 * @param {string} [options.format='webp']    webp | jpg | png | auto
 * @param {string} [options.focus]            imagekit crop focus, e.g. 'main'
 */
export function imageUrl(url, options = {}) {
  if (!isImageKitUrl(url)) return url;

  const {
    width,
    height,
    quality = 70,
    format = 'webp',
    focus,
  } = options;

  // Fall back to JPEG where WebP is unsupported rather than serving broken images.
  const resolvedFormat = format === 'webp' && !supportsWebp() ? 'jpg' : format;

  const parts = [];
  if (width) parts.push(`w-${width}`);
  if (height) parts.push(`h-${height}`);
  if (focus) parts.push(`c-${focus}`);
  parts.push(`q-${quality}`);
  if (resolvedFormat && resolvedFormat !== 'auto') parts.push(`f-${resolvedFormat}`);

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}tr=${parts.join(',')}`;
}

let webpSupport = null;
function supportsWebp() {
  if (webpSupport !== null) return webpSupport;
  if (typeof document === 'undefined') return true;
  webpSupport = document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
  return webpSupport;
}

/**
 * Common presets so components stay readable.
 */
export const presets = {
  card: { width: 800, quality: 70, format: 'webp' },
  thumbnail: { width: 400, quality: 70, format: 'webp' },
  avatar: { width: 200, height: 200, quality: 75, format: 'webp', focus: 'main' },
  hero: { width: 1920, quality: 70, format: 'webp' },
  detail: { width: 1400, quality: 75, format: 'webp' },
};

export default imageUrl;
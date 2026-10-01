/**
 * CDN cache headers for public GET endpoints.
 *
 * `s-maxage` is what Vercel's edge cache honours; the browser is told to
 * revalidate so a stale edge entry is always replaced in the background.
 * `stale-while-revalidate` serves the stale copy immediately while a single
 * origin request refreshes it, which is what converts cache misses into hits.
 */
const publicCache = (seconds = 60, staleSeconds = 300) => (req, res, next) => {
  if (req.method !== 'GET') return next();

  const existing = res.getHeader('Cache-Control');
  if (!existing) {
    res.setHeader(
      'Cache-Control',
      `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${staleSeconds}`
    );
  }
  res.setHeader('CDN-Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${staleSeconds}`);
  return next();
};

/**
 * Private/admin data must never be cached by the edge.
 */
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('CDN-Cache-Control', 'no-store');
  return next();
};

export { publicCache, noCache };
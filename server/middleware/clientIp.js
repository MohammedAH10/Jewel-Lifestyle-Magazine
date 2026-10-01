import crypto from 'crypto';

const SALT = process.env.VOTE_IP_SALT || process.env.JWT_SECRET || 'jewel-vote-salt';

/**
 * Best-effort client IP. Vercel sets `x-forwarded-for` and `x-real-ip`;
 * the left-most entry of `x-forwarded-for` is the original client.
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
};

/**
 * Normalises an address so the same device cannot vote twice using
 * equivalent representations (e.g. `::ffff:1.2.3.4` and `1.2.3.4`, or
 * different IPv6 textual forms of one address).
 */
const normalizeIp = (ip) => {
  if (!ip || ip === 'unknown') return 'unknown';
  const stripped = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  // Strip a zone index such as `fe80::1%eth0`.
  const withoutZone = stripped.split('%')[0];
  return withoutZone.toLowerCase();
};

/**
 * Returns a stable, non-reversible fingerprint for an IP. Storing the raw
 * address would keep personal data in the votes collection, so only the hash
 * is persisted.
 */
const hashIp = (ip) =>
  crypto.createHash('sha256').update(`${SALT}:${normalizeIp(ip)}`).digest('hex');

export { getClientIp, normalizeIp, hashIp };
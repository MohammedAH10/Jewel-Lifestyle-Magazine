import crypto from 'crypto';

export function generateDeviceId(req) {
  const userAgent = req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const storedUuid = req.headers['x-device-uuid'] || '';
  const raw = `${userAgent}|${ip}|${storedUuid}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
}

export function getDeviceInfo(req) {
  return {
    device_name: req.headers['x-device-name'] || req.headers['user-agent']?.slice(0, 80) || 'Unknown Device',
    user_agent: req.headers['user-agent'] || '',
    ip_address: req.ip || req.connection?.remoteAddress || '',
  };
}

import AdminDevice from '../models/AdminDevice.js';
import { generateDeviceId } from '../utils/deviceFingerprint.js';

export async function validateDevice(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return next();
  }

  try {
    const deviceId = generateDeviceId(req);
    const device = await AdminDevice.findOne({ device_id: deviceId, user: req.user.id });

    if (!device) {
      return res.status(403).json({
        error: 'Device not recognized',
        code: 'DEVICE_NOT_REGISTERED',
        device_id: deviceId,
      });
    }

    if (!device.approved) {
      return res.status(403).json({
        error: 'Device not approved',
        code: 'DEVICE_NOT_APPROVED',
        device_id: deviceId,
      });
    }

    if (!device.is_active) {
      return res.status(403).json({
        error: 'Device is inactive',
        code: 'DEVICE_INACTIVE',
        device_id: deviceId,
      });
    }

    device.last_seen = new Date();
    await device.save();

    req.device = device;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

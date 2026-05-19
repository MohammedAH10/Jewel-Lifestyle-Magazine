import { Router } from 'express';
import AdminDevice from '../models/AdminDevice.js';
import DeviceAccessRequest from '../models/DeviceAccessRequest.js';
import { authenticate, adminOnly } from '../middleware/auth.js';
import { generateDeviceId, getDeviceInfo } from '../utils/deviceFingerprint.js';
import { sendDeviceApprovalEmail, sendDeviceApprovalResultEmail } from '../utils/email.js';

const router = Router();

router.post('/register', authenticate, adminOnly, async (req, res) => {
  try {
    const deviceId = generateDeviceId(req);
    const deviceInfo = getDeviceInfo(req);

    let device = await AdminDevice.findOne({ device_id: deviceId, user: req.user.id });

    if (device) {
      device.last_seen = new Date();
      await device.save();
      return res.json({ device, message: 'Device already registered' });
    }

    const existingDevices = await AdminDevice.countDocuments({ user: req.user.id });

    if (existingDevices === 0) {
      device = await AdminDevice.create({
        user: req.user.id,
        device_id: deviceId,
        ...deviceInfo,
        is_primary: true,
        is_active: true,
        approved: true,
      });
      return res.json({ device, message: 'Primary device registered' });
    }

    device = await AdminDevice.create({
      user: req.user.id,
      device_id: deviceId,
      ...deviceInfo,
      is_primary: false,
      is_active: false,
      approved: false,
    });

    await DeviceAccessRequest.create({
      device_id: deviceId,
      user: req.user.id,
      user_agent: deviceInfo.user_agent,
      ip_address: deviceInfo.ip_address,
      status: 'pending',
    });

    await sendDeviceApprovalEmail({
      device_id: deviceId,
      ...deviceInfo,
    });

    res.json({ device, message: 'Device registration pending approval. An email has been sent to the admin.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/check', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const deviceId = req.headers['x-device-id'] || generateDeviceId(req);

    const device = await AdminDevice.findOne({ device_id: deviceId }).populate('user', 'email');
    if (!device) {
      return res.json({ registered: false, device_id: deviceId });
    }

    const isAllowed = device.is_primary || (device.approved && device.is_active);
    res.json({
      registered: true,
      allowed: isAllowed,
      device_id: deviceId,
      is_primary: device.is_primary,
      approved: device.approved,
      is_active: device.is_active,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/list', authenticate, adminOnly, async (req, res) => {
  try {
    const devices = await AdminDevice.find({ user: req.user.id }).sort({ is_primary: -1, createdAt: -1 });
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/requests', authenticate, adminOnly, async (req, res) => {
  try {
    const requests = await DeviceAccessRequest.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('user', 'email name');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/approve/:deviceId', async (req, res) => {
  try {
    const device = await AdminDevice.findOne({ device_id: req.params.deviceId });
    if (!device) return res.status(404).send('Device not found');

    if (device.is_primary) return res.status(400).send('Primary device cannot be re-approved');

    const activeSecondaryCount = await AdminDevice.countDocuments({
      user: device.user,
      is_primary: false,
      is_active: true,
    });

    if (activeSecondaryCount >= 2) {
      const oldestSecondary = await AdminDevice.findOne({
        user: device.user,
        is_primary: false,
        is_active: true,
      }).sort({ last_seen: 1 });

      if (oldestSecondary) {
        oldestSecondary.is_active = false;
        await oldestSecondary.save();
      }
    }

    device.approved = true;
    device.is_active = true;
    await device.save();

    await DeviceAccessRequest.updateMany(
      { device_id: device.device_id, status: 'pending' },
      { status: 'approved' }
    );

    await sendDeviceApprovalResultEmail(device.device_id, true);

    res.send(`
      <html><body style="background:#0a0a0a;color:#FAF9F6;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="text-align:center;">
          <h1 style="color:#D4AF37;">Device Approved ✓</h1>
          <p>This device can now access the admin panel.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/Login" style="display:inline-block;margin-top:20px;padding:12px 30px;background:#D4AF37;color:#000;text-decoration:none;font-weight:bold;">Go to Login</a>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send('Error approving device');
  }
});

router.get('/reject/:deviceId', async (req, res) => {
  try {
    const device = await AdminDevice.findOne({ device_id: req.params.deviceId });
    if (!device) return res.status(404).send('Device not found');

    await DeviceAccessRequest.updateMany(
      { device_id: device.device_id, status: 'pending' },
      { status: 'rejected' }
    );

    await AdminDevice.deleteOne({ device_id: req.params.deviceId, is_primary: false });

    await sendDeviceApprovalResultEmail(req.params.deviceId, false);

    res.send(`
      <html><body style="background:#0a0a0a;color:#FAF9F6;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="text-align:center;">
          <h1 style="color:#f44336;">Device Rejected ✗</h1>
          <p>The device access request has been denied.</p>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send('Error rejecting device');
  }
});

router.post('/remove/:deviceId', authenticate, adminOnly, async (req, res) => {
  try {
    const device = await AdminDevice.findOne({ device_id: req.params.deviceId, user: req.user.id });
    if (!device) return res.status(404).json({ error: 'Device not found' });
    if (device.is_primary) return res.status(400).json({ error: 'Cannot remove primary device' });

    device.is_active = false;
    device.approved = false;
    await device.save();

    res.json({ message: 'Device removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

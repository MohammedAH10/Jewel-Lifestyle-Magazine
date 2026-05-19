import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AdminDevice from '../models/AdminDevice.js';
import DeviceAccessRequest from '../models/DeviceAccessRequest.js';
import { authenticate } from '../middleware/auth.js';
import { generateDeviceId, getDeviceInfo } from '../utils/deviceFingerprint.js';
import { sendDeviceApprovalEmail } from '../utils/email.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jewel-magazine-secret-key-2024';
const MAX_ADMINS = 5;

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    const count = await User.countDocuments();
    if (count >= MAX_ADMINS) {
      return res.status(400).json({ error: 'Maximum number of admins reached' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = await User.create({ email, password, name });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    const deviceId = generateDeviceId(req);
    const deviceInfo = getDeviceInfo(req);
    await AdminDevice.create({
      user: user._id,
      device_id: deviceId,
      ...deviceInfo,
      is_primary: true,
      is_active: true,
      approved: true,
    });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      device: { device_id: deviceId, is_primary: true },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const deviceId = generateDeviceId(req);
    const deviceInfo = getDeviceInfo(req);

    let device = await AdminDevice.findOne({ device_id: deviceId });

    if (!device) {
      const existingDevices = await AdminDevice.countDocuments({ user: user._id });

      if (existingDevices === 0) {
        device = await AdminDevice.create({
          user: user._id,
          device_id: deviceId,
          ...deviceInfo,
          is_primary: true,
          is_active: true,
          approved: true,
        });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          token,
          user: { id: user._id, email: user.email, name: user.name, role: user.role },
          device: { device_id: deviceId, is_primary: true, approved: true, is_active: true },
        });
      }

      device = await AdminDevice.create({
        user: user._id,
        device_id: deviceId,
        ...deviceInfo,
        is_primary: false,
        is_active: false,
        approved: false,
      });

      await DeviceAccessRequest.create({
        device_id: deviceId,
        user: user._id,
        user_agent: deviceInfo.user_agent,
        ip_address: deviceInfo.ip_address,
        status: 'pending',
      });

      await sendDeviceApprovalEmail({
        device_id: deviceId,
        ...deviceInfo,
      });

      return res.status(403).json({
        error: 'This device is not recognized. An approval request has been sent to the admin email.',
        code: 'DEVICE_PENDING_APPROVAL',
        device_id: deviceId,
      });
    }

    const isAllowed = device.is_primary || (device.approved && device.is_active);

    if (!isAllowed) {
      if (!device.approved) {
        return res.status(403).json({
          error: 'This device has not been approved yet.',
          code: 'DEVICE_NOT_APPROVED',
          device_id: deviceId,
        });
      }
      return res.status(403).json({
        error: 'This device is inactive.',
        code: 'DEVICE_INACTIVE',
        device_id: deviceId,
      });
    }

    device.last_seen = new Date();
    if (deviceInfo.user_agent) device.user_agent = deviceInfo.user_agent;
    if (deviceInfo.ip_address) device.ip_address = deviceInfo.ip_address;
    await device.save();

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      device: { device_id: deviceId, is_primary: device.is_primary, approved: device.approved, is_active: device.is_active },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

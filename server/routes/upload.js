import { Router } from 'express';
import multer from 'multer';
import { authenticate, adminOnly } from '../middleware/auth.js';
import imagekit from '../config/imagekit.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

router.post('/', authenticate, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const folder = req.query.folder ? String(req.query.folder) : 'uploads';
    const file_url = await imagekit.uploadBuffer(req.file.buffer, {
      fileName: req.file.originalname,
      folder,
    });
    res.json({ file_url });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

export default router;
import { Router } from 'express';
import multer from 'multer';
import { authenticate, adminOnly } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
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
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'jewel-magazine', resource_type: 'auto' },
          (err, result) => {
            if (err) return reject(err);
            res.json({ file_url: result.secure_url, public_id: result.public_id });
          }
        );
        stream.end(req.file.buffer);
      });
    }
    const filename = `${Date.now()}-${req.file.originalname}`;
    const fs = await import('fs/promises');
    const path = await import('path');
    const uploadDir = path.resolve('server/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, req.file.buffer);
    const file_url = `/uploads/${filename}`;
    res.json({ file_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import multer from 'multer';

const uploadRouter = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

uploadRouter.post(
  '/',
  requireAuth,
  upload.single('image'),
  async (req, res) => {}
);

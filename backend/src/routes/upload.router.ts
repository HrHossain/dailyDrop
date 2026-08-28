import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth.js';
import multer from 'multer';
import { upload } from '../middlewares/upload.middleware.js';

const uploadRouter = Router();

uploadRouter.post('/', requireAuth, upload.single('image'), uploadRouter);

export default uploadRouter;

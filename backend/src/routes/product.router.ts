import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getFlashDeals,
  getProduct,
  getProducts,
  updateProduct,
} from '../controllers/product/product.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { checkAdmin } from '../middlewares/requireRole.js';

const productRouter = Router();

productRouter.get('/flash-deals', getFlashDeals);

productRouter.get('/', getProducts);
productRouter.get('/:id', getProduct);
productRouter.post('/', requireAuth, checkAdmin, createProduct);
productRouter.put('/:id', requireAuth, checkAdmin, updateProduct);
productRouter.delete('/:id', requireAuth, checkAdmin, deleteProduct);

export default productRouter;

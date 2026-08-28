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
import { admin } from '../middlewares/requireRole.js';

const productRouter = Router();

productRouter.get('/flash-deals', getFlashDeals);

productRouter.get('/', getProducts);
productRouter.get('/:id', getProduct);
productRouter.post('/', requireAuth, admin, createProduct);
productRouter.put('/:id', requireAuth, admin, updateProduct);
productRouter.delete('/:id', requireAuth, admin, deleteProduct);

export default productRouter;

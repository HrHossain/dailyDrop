import { Request, Response,NextFunction } from 'express';
import { prisma } from '../../lib/prisma.js';
import { ApiResponse } from '../../utils/apiresponse.js';
import { getDiscount } from '../../utils/product/getDiscount.js';

// GET /api/v1/products/flash-deals
export const getFlashDeals = async (req: Request, res: Response) => {
  // 1. Fetch only the required 8 items directly from the database (Performance boost)
  const products = await prisma.product.findMany({
    where: {
      stock: {
        gt: 0,
      },
    },
    orderBy: {
      originalPrice: 'desc', // Fixed typo consistency
    },
    take: 8, // Replaces .slice(0, 8) in memory
  });

  // 2. Map and calculate discount safely
  const productsWithDiscount = products.map((p) => {
    const discount = getDiscount(p);
    return {
      ...p,
      discount,
    };
  });

  return res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'Flash deals fetched successfully',
      data: productsWithDiscount,
    })
  );
};

// GET api/v1/products

export const getProducts = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  const { category, search, minPrice, maxPrice, sort, page = '1', limit = '10' } = req.query;

  // ১. পেজিনেশন লজিক
  const pageNumber = parseInt(page as string, 10) || 1;
  const limitNumber = parseInt(limit as string, 10) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const where: any = {};
  if (category && category !== 'all') {
    where.category = category as string;
  }
  
  if (search) {
    where.name = { contains: search as string, mode: 'insensitive' };
  }

  // ২. প্রাইস ভ্যালিডেশন (NaN রোধ করতে !isNaN চেক)
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice && !isNaN(Number(minPrice))) {
      where.price.gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      where.price.lte = Number(maxPrice);
    }
  }

  const orderBy: any = {};
  if (sort === 'price-low') {
    orderBy.price = 'asc';
  } else if (sort === 'price-high') {
    orderBy.price = 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  // ৩. একসাথে প্রোডাক্ট এবং মোট কাউন্ট ফেচ করা (Performance Optimized)
  const [products, totalProducts] = await Promise.all([
    prisma.product.findMany({ 
      where, 
      orderBy,
      skip,
      take: limitNumber
    }),
    prisma.product.count({ where })
  ]);

  const productsWithDiscount = products.map((p) => {
    const discount = getDiscount(p);
    return {
      ...p,
      discount,
    };
  });

  // ৪. রেসপন্স এবং পেজিনেশন মেটাডেটা পাঠানো
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'Products fetched successfully',
      data: productsWithDiscount,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total: totalProducts,
        totalPages: Math.ceil(totalProducts / limitNumber)
      }
    })
  );
};

// GET api/v1/product/:id
export const getProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id as string },
  });

  if (!product) {
    return res.status(404).json(
      new ApiResponse({
        statusCode: 404,
        message: 'Product not found',
        data: null,
      })
    );
  }
  const discount = getDiscount(product);

  return res.status(404).json(
    new ApiResponse({
      statusCode: 404,
      message: 'Product not found',
      data: {
        product: {
          ...product,
          discount,
        },
      },
    })
  );
};

// POST /api/v1/products
export const createProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.create({ data: req.body });
  res.status(201).json(
    new ApiResponse({
      statusCode: 201,
      message: 'Product not found',
      data: {
        product,
      },
    })
  );
};

// PUT /api/v1/products/:id
export const updateProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.update({
    where: { id: req.params.id as string },
    data: req.body,
  });
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'Data updated successfully',
      data: product,
    })
  );
};

// DELETE /api/v1/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
  const product = await prisma.product.delete({
    where: { id: req.params.id as string },
  });
  res.status(200).json(
    new ApiResponse({
      statusCode: 200,
      message: 'Data deleted successfully',
      data: product,
    })
  );
};

import { Request, Response, NextFunction } from 'express';
import { getProducts, getProductById } from '../services/product.service';
import { ApiResponse } from '../types';

export const listProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      limit = '20',
      offset = '0',
    } = req.query as Record<string, string>;

    const result = await getProducts({
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      limit: Math.min(parseInt(limit, 10), 100),
      offset: parseInt(offset, 10),
    });

    res.status(200).json({
      success: true,
      data: result,
    } satisfies ApiResponse);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid product ID',
      } satisfies ApiResponse);
      return;
    }

    const product = await getProductById(id);
    res.status(200).json({
      success: true,
      data: product,
    } satisfies ApiResponse);
  } catch (err) {
    next(err);
  }
};
import pool from '../db/connection';
import { Product } from '../types';
import { AppError } from '../middleware/errorHandler';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}

export const getProducts = async (filters: ProductFilters = {}): Promise<PaginatedProducts> => {
  const { category, minPrice, maxPrice, limit = 20, offset = 0 } = filters;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (minPrice !== undefined) {
    conditions.push('price >= ?');
    params.push(minPrice);
  }
  if (maxPrice !== undefined) {
    conditions.push('price <= ?');
    params.push(maxPrice);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await pool.execute<any[]>(
    `SELECT COUNT(*) as total FROM products ${where}`,
    params
  );
  const total = countRows[0].total as number;

  const [rows] = await pool.execute<any[]>(
    `SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return {
    products: rows as Product[],
    total,
    limit,
    offset,
  };
};

export const getProductById = async (id: number): Promise<Product> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM products WHERE id = ? LIMIT 1',
    [id]
  );

  const product = rows[0] as Product | undefined;
  if (!product) {
    throw new AppError(404, `Product with id ${id} not found`);
  }

  return product;
};
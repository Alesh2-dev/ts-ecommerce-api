import { Request } from 'express';

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'customer';
  created_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  created_at: Date;
}

// ─── Request / Response DTOs ──────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

// ─── API Response Envelope ──────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// ─── Express Extensions ───────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
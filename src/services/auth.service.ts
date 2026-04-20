import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connection';
import { config } from '../config/env';
import { User, AuthPayload } from '../types';
import { AppError } from '../middleware/errorHandler';

interface LoginResult {
  token: string;
  user: Omit<User, 'password_hash'>;
}

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  const user = rows[0] as User | undefined;

  if (!user) {
    // Timing-safe: still run bcrypt even if user not found
    await bcrypt.compare(password, '$2b$10$invalidhashfortimingsafety000000000000000000000');
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  const payload: AuthPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

  const { password_hash, ...safeUser } = user;

  return { token, user: safeUser };
};
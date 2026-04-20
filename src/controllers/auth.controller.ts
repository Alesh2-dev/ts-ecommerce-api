import { Request, Response, NextFunction } from 'express';
import { loginUser } from '../services/auth.service';
import { LoginDto, ApiResponse } from '../types';

export const login = async (
  req: Request<{}, {}, LoginDto>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    } satisfies ApiResponse);
  } catch (err) {
    next(err);
  }
};
import { Request, Response } from 'express';
import pool from '../db/connection';
import { ApiResponse } from '../types';

export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  let dbStatus = 'disconnected';

  try {
    const connection = await pool.getConnection();
    connection.release();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const status = dbStatus === 'connected' ? 'ok' : 'degraded';

  res.status(status === 'ok' ? 200 : 503).json({
    success: status === 'ok',
    data: {
      status,
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
      services: {
        database: dbStatus,
      },
    },
  } satisfies ApiResponse);
};
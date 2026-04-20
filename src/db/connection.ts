import mysql from 'mysql2/promise';
import { config } from '../config/env';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

export const testConnection = async (): Promise<void> => {
  const connection = await pool.getConnection();
  connection.release();
  console.log('MySQL connected successfully');
};

export default pool;
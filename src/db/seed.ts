/**
 * Database seed script
 * Usage: npm run db:seed
 */

import bcrypt from 'bcryptjs';
import pool from './connection';
import { config } from '../config/env';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 10;

async function seed(): Promise<void> {
  console.log('Starting database seed...\n');

  // ─── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
  const userHash = await bcrypt.hash('user123', SALT_ROUNDS);

  await pool.execute(`
    INSERT IGNORE INTO users (name, email, password_hash, role)
    VALUES
      ('Admin User',  'admin@example.com', ?, 'admin'),
      ('Jane Doe',    'jane@example.com',  ?, 'customer')
  `, [adminHash, userHash]);

  console.log('Users seeded');

  // ─── Products ───────────────────────────────────────────────────────────────
  await pool.execute(`
    INSERT IGNORE INTO products (name, description, price, stock, category)
    VALUES
      ('Wireless Headphones',  'Over-ear noise-cancelling headphones with 30hr battery',  79.99,  50, 'Electronics'),
      ('Mechanical Keyboard',  'Compact TKL keyboard with Cherry MX Brown switches',      129.99, 30, 'Electronics'),
      ('Standing Desk Mat',    'Anti-fatigue ergonomic mat, 32x20 inches',                39.99,  100,'Ergonomics'),
      ('USB-C Hub 7-in-1',     'Supports 4K HDMI, 100W PD, 3x USB-A, SD card reader',    49.99,  75, 'Electronics'),
      ('Laptop Backpack',      'Water-resistant 15.6" laptop backpack with USB port',     59.99,  60, 'Accessories')
  `);

  console.log('Products seeded');

  console.log('Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
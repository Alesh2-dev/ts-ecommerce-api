import { Router } from 'express';
import { body } from 'express-validator';
import { login } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ]),
  login
);

export default router;
import express from 'express';
import { body } from 'express-validator';

import { deleteAccount } from '../controllers/auth/deleteAccount';
import { login } from '../controllers/auth/login';
import { logout } from '../controllers/auth/logout';
import { signup } from '../controllers/auth/signup';
import { authorization } from '../middlewares/authorization';

export const authRouter = express.Router();

authRouter.post(
  '/signup',
  // username must be at most 35 chars long
  body('username').isLength({ max: 35 }),
  // email must be an email
  body('email').isEmail().normalizeEmail(),
  // password must be strong and at most 20 chars long
  body('password').isStrongPassword().isLength({ max: 20 }),
  signup
);

authRouter.post(
  '/login', // email must be an email
  body('email').isEmail().normalizeEmail(),
  // password must be strong and at least 8 chars long
  body('password').isStrongPassword().isLength({ max: 20 }),
  // password must be at most 20 chars long
  body('password').isLength({ max: 20 }),
  login
);

authRouter.get('/logout', authorization, logout);

authRouter.delete('/delete-account', authorization, deleteAccount);

import express from 'express';
import { body } from 'express-validator';

import {
  deleteAccount,
  DeleteAccountReqBody,
} from '../controllers/auth/deleteAccount';
import { login, LoginReqBody } from '../controllers/auth/login';
import { logout } from '../controllers/auth/logout';
import { signup, SignupReqBody } from '../controllers/auth/signup';
import { authorization } from '../middlewares/authorization';

export const authRouter = express.Router();

authRouter.post<
  Record<string, any> | undefined,
  unknown,
  SignupReqBody,
  Record<string, any> | undefined,
  Record<string, any>
>(
  '/signup',
  // username must be at most 35 chars long
  body('username').isLength({ max: 35 }),
  // email must be an email
  body('email').isEmail().normalizeEmail(),
  // password must be strong and at most 20 chars long
  body('password').isStrongPassword().isLength({ max: 20 }),
  signup
);

authRouter.post<
  Record<string, any> | undefined,
  unknown,
  LoginReqBody,
  Record<string, any> | undefined,
  Record<string, any>
>(
  '/login', // email must be an email
  body('email').isEmail().normalizeEmail(),
  // password must be strong and at least 8 chars long
  body('password').isStrongPassword().isLength({ max: 20 }),
  // password must be at most 20 chars long
  body('password').isLength({ max: 20 }),
  login
);

authRouter.get('/logout', authorization, logout);

authRouter.delete<
  unknown,
  unknown,
  DeleteAccountReqBody,
  unknown,
  Record<string, any>
>('/delete-account', authorization, deleteAccount);

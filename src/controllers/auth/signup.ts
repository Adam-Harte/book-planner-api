import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { UsersRepository } from '../../repositories/users';
import { HttpCode } from '../../types/httpCode';

export interface SignupReqBody {
  username: string;
  email: string;
  password: string;
}

export const signup = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    SignupReqBody,
    Record<string, any> | undefined,
    Record<string, any>
  >,
  res: Response
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

  const { username, email, password } = req.body;

  try {
    const userWithEmail = await UsersRepository.findByEmail(email);

    if (userWithEmail) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        message: 'A user with this email already exists.',
      });
    }

    const hashedPw = await bcrypt.hash(password, 12);

    const user = await UsersRepository.create({
      username,
      email,
      password: hashedPw,
    });

    const result = await UsersRepository.save(user);

    // give the user a login token after user created on singup and add to cookies
    const token = jwt.sign(
      {
        username: result.username,
        email: result.email,
        userId: result.id.toString(),
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    return res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .status(HttpCode.CREATED)
      .json({
        message: 'User created.',
        userId: result.id,
      });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

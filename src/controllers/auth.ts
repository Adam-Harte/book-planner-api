import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { UsersRepository } from '../repositories/users';
import { HttpCode } from '../types/httpCode';

export const signup = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

  const { username, email, password } = req.body;

  const userWithEmail = await UsersRepository.findByEmail(email);

  if (userWithEmail) {
    return res.status(HttpCode.UNAUTHORIZED).json({
      message: 'A user with this email already exists.',
    });
  }

  try {
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

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await UsersRepository.findByEmail(email);

    if (!user) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        message: 'A user with this email could not be found.',
      });
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      return res.status(HttpCode.UNAUTHORIZED).json({
        message: 'Incorrect password.',
      });
    }

    const token = jwt.sign(
      {
        username: user.username,
        email: user.email,
        userId: user.id.toString(),
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // add token to cookie
    return res
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      })
      .status(HttpCode.OK)
      .json({
        userId: user.id.toString(),
      });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

export const logout = (req: Request, res: Response) => {
  return res
    .clearCookie('access_token')
    .status(HttpCode.OK)
    .json({ message: 'Successfully logged out.' });
};

export const deleteAccount = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (req.userId !== id.toString()) {
    return res.status(HttpCode.FORBIDDEN).json({
      message: 'Forbidden account action.',
    });
  }

  const user = await UsersRepository.findOne({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(HttpCode.NOT_FOUND).json({
      message: 'User not found.',
    });
  }

  try {
    await UsersRepository.delete(id);
    return res
      .clearCookie('access_token')
      .status(HttpCode.OK)
      .json({ message: 'Successfully deleted user.' });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

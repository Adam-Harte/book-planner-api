import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { UsersRepository } from '../../repositories/users';
import { HttpCode } from '../../types/httpCode';

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

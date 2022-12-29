import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AuthTokenPayload } from '../types/authTokenPayload';

export const authorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.sendStatus(401);
  }
  try {
    const data = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthTokenPayload;
    req.userId = data.userId;
    req.username = data.username;
    return next();
  } catch {
    return res.sendStatus(500);
  }
};

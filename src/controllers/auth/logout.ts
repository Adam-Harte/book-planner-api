import { Request, Response } from 'express';

import { HttpCode } from '../../types/httpCode';

export const logout = (req: Request, res: Response) => {
  return res
    .clearCookie('access_token')
    .status(HttpCode.OK)
    .json({ message: 'Successfully logged out.' });
};

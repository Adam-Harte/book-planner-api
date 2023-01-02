import { Request, Response } from 'express';

import { UsersRepository } from '../../repositories/users';
import { HttpCode } from '../../types/httpCode';

export const deleteAccount = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (req.userId !== id.toString()) {
    return res.status(HttpCode.FORBIDDEN).json({
      message: 'Forbidden account action.',
    });
  }

  try {
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

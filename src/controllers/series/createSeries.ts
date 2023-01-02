import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { SeriesRepository } from '../../repositories/series';
import { UsersRepository } from '../../repositories/users';
import { HttpCode } from '../../types/httpCode';

export const createSeries = async (req: Request, res: Response) => {
  const { name, genre } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

  try {
    const user = await UsersRepository.findOne({
      where: {
        id: parseInt(req.userId as string, 10),
      },
    });

    const series = await SeriesRepository.create({
      name,
      genre,
      ...(user && { user }),
    });
    const {
      id,
      name: dataName,
      genre: dataGenre,
    } = await SeriesRepository.save(series);

    return res.status(HttpCode.CREATED).json({
      message: 'Series created.',
      data: {
        id,
        name: dataName,
        genre: dataGenre,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

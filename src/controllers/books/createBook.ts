import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { Genre } from '../../models/types/enums';
import { BooksRepository } from '../../repositories/books';
import { SeriesRepository } from '../../repositories/series';
import { UsersRepository } from '../../repositories/users';
import { HttpCode } from '../../types/httpCode';

export interface CreateBookReqBody {
  name: string;
  genre?: Genre;
}

export interface CreateBookReqQuery {
  seriesId?: string;
}

export const createBook = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateBookReqBody,
    CreateBookReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, genre } = req.body;
  const { seriesId } = req.query;
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

    let series;

    if (seriesId) {
      series = await SeriesRepository.getByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId, 10)
      );
    }

    const book = await BooksRepository.create({
      name,
      genre,
      ...(series && { series }),
      ...(user && { user }),
    });
    const {
      id,
      name: dataName,
      genre: dataGenre,
    } = await BooksRepository.save(book);

    return res.status(HttpCode.CREATED).json({
      message: 'Book created.',
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

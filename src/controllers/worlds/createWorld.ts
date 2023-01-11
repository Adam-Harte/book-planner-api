import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { BooksRepository } from '../../repositories/books';
import { SeriesRepository } from '../../repositories/series';
import { WorldsRepository } from '../../repositories/worlds';
import { HttpCode } from '../../types/httpCode';

export interface CreateWorldReqBody {
  name: string;
  description?: string;
}

export interface CreateWorldReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createWorld = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateWorldReqBody,
    CreateWorldReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, description } = req.body;
  const { seriesId, bookId } = req.query;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let series;
    let book;

    if (seriesId) {
      series = await SeriesRepository.getByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId, 10)
      );
    }

    if (bookId) {
      book = await BooksRepository.getByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId, 10)
      );
    }

    if (!series && !book) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'A world must be created belonging to one of your series or books.',
      });
    }

    const world = await WorldsRepository.create({
      name,
      description,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      name: dataName,
      description: dataDescription,
    } = await WorldsRepository.save(world);

    return res.status(HttpCode.CREATED).json({
      message: 'World created.',
      data: {
        id,
        name: dataName,
        description: dataDescription,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

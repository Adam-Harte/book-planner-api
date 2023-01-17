import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { BooksRepository } from '../../repositories/books';
import { SeriesRepository } from '../../repositories/series';
import { TechnologiesRepository } from '../../repositories/technologies';
import { HttpCode } from '../../types/httpCode';

export interface CreateTechnologyReqBody {
  name: string;
  description?: string;
  inventor?: string;
}

export interface CreateTechnologyReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createTechnology = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateTechnologyReqBody,
    CreateTechnologyReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, description, inventor } = req.body;
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
          'A technology must be created belonging to one of your series or books.',
      });
    }

    const technology = await TechnologiesRepository.create({
      name,
      description,
      inventor,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      name: dataName,
      description: dataDescription,
      inventor: dataInventor,
    } = await TechnologiesRepository.save(technology);

    return res.status(HttpCode.CREATED).json({
      message: 'Technology created.',
      data: {
        id,
        name: dataName,
        description: dataDescription,
        inventor: dataInventor,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

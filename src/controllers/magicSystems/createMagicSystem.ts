import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { BooksRepository } from '../../repositories/books';
import { MagicSystemsRepository } from '../../repositories/magicSystems';
import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface CreateMagicSystemReqBody {
  name: string;
  description?: string;
  rules?: string;
}

export interface CreateMagicSystemReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createMagicSystem = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateMagicSystemReqBody,
    CreateMagicSystemReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, description, rules } = req.body;
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
          'A magic system must be created belonging to one of your series or books.',
      });
    }

    const magicSystem = await MagicSystemsRepository.create({
      name,
      description,
      rules,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      name: dataName,
      description: dataDescription,
      rules: dataRules,
    } = await MagicSystemsRepository.save(magicSystem);

    return res.status(HttpCode.CREATED).json({
      message: 'Magic System created.',
      data: {
        id,
        name: dataName,
        description: dataDescription,
        rules: dataRules,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { BattlesRepository } from '../../repositories/battles';
import { BooksRepository } from '../../repositories/books';
import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface CreateBattleReqBody {
  name: string;
  start?: string;
  end?: string;
  description?: string;
}

export interface CreateBattleReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createBattle = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateBattleReqBody,
    CreateBattleReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, start, end, description } = req.body;
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
          'A battle must be created belonging to one of your series or books.',
      });
    }

    const battle = await BattlesRepository.create({
      name,
      start,
      end,
      description,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      name: dataName,
      start: dataStart,
      end: dataEnd,
      description: dataDescription,
    } = await BattlesRepository.save(battle);

    return res.status(HttpCode.CREATED).json({
      message: 'Battle created.',
      data: {
        id,
        name: dataName,
        start: dataStart,
        end: dataEnd,
        description: dataDescription,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

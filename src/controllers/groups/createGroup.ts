import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { GroupType } from '../../models/types/enums';
import { BooksRepository } from '../../repositories/books';
import { GroupsRepository } from '../../repositories/groups';
import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface CreateGroupReqBody {
  name: string;
  type?: GroupType;
  description?: string;
}

export interface CreateGroupReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createGroup = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateGroupReqBody,
    CreateGroupReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, type, description } = req.body;
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
          'A group must be created belonging to one of your series or books.',
      });
    }

    const group = await GroupsRepository.create({
      name,
      type,
      description,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      name: dataName,
      type: dataType,
      description: dataDescription,
    } = await GroupsRepository.save(group);

    return res.status(HttpCode.CREATED).json({
      message: 'Group created.',
      data: {
        id,
        name: dataName,
        type: dataType,
        description: dataDescription,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { HeightMetric, WeightMetric } from '../../models/types/enums';
import { BooksRepository } from '../../repositories/books';
import { CreaturesRepository } from '../../repositories/creatures';
import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface CreateCreatureReqBody {
  name: string;
  height?: number;
  heightMetric?: HeightMetric;
  weight?: number;
  weightMetric?: WeightMetric;
  physicalDescription?: string;
  personalityDescription?: string;
  image?: string;
}

export interface CreateCreatureReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createCreature = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateCreatureReqBody,
    CreateCreatureReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, physicalDescription, personalityDescription } = req.body;
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
          'A creature must be created belonging to one of your series or books.',
      });
    }

    const creature = await CreaturesRepository.create({
      name,
      physicalDescription,
      personalityDescription,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      name: dataName,
      physicalDescription: dataPhysicalDescription,
      personalityDescription: dataPersonalityDescription,
    } = await CreaturesRepository.save(creature);

    return res.status(HttpCode.CREATED).json({
      message: 'Creature created.',
      data: {
        id,
        name: dataName,
        physicalDescription: dataPhysicalDescription,
        personalityDescription: dataPersonalityDescription,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

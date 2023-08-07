import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { CreaturesRepository } from '../../repositories/creatures';
import { HttpCode } from '../../types/httpCode';

export interface UpdateCreatureReqParams {
  creatureId: string;
}

export interface UpdateCreatureReqBody {
  updatedData: {
    name?: string;
    physicalDescription?: string;
    personalityDescription?: string;
  };
}

export interface UpdateCreatureReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateCreatureById = async (
  req: Request<
    UpdateCreatureReqParams,
    unknown,
    UpdateCreatureReqBody,
    UpdateCreatureReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { creatureId } = req.params;
  const { updatedData } = req.body;
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

    let seriesCreature;
    let bookCreature;

    if (seriesId) {
      seriesCreature = await CreaturesRepository.getByUserIdAndSeriesId(
        parseInt(creatureId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookCreature = await CreaturesRepository.getByUserIdAndBookId(
        parseInt(creatureId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesCreature && !bookCreature) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    const updatedCreature = {
      ...seriesCreature,
      ...bookCreature,
      ...updatedData,
    };

    const { id, name, physicalDescription, personalityDescription } =
      await CreaturesRepository.save(updatedCreature);

    return res.status(HttpCode.OK).json({
      message: 'Creature updated.',
      data: {
        id,
        name,
        physicalDescription,
        personalityDescription,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

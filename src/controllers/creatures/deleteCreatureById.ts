import { Request, Response } from 'express';

import { CreaturesRepository } from '../../repositories/creatures';
import { HttpCode } from '../../types/httpCode';

export interface DeleteCreatureReqParams {
  creatureId: string;
}

export interface DeleteCreatureReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteCreatureById = async (
  req: Request<
    DeleteCreatureReqParams,
    unknown,
    unknown,
    DeleteCreatureReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { creatureId } = req.params;
  const { seriesId, bookId } = req.query;

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

    await CreaturesRepository.delete(parseInt(creatureId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Creature deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

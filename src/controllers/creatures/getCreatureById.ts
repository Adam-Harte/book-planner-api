import { Request, Response } from 'express';

import { CreaturesRepository } from '../../repositories/creatures';
import { HttpCode } from '../../types/httpCode';

export interface GetCreatureByIdReqParams {
  creatureId: string;
}

export interface GetCreatureByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getCreatureById = async (
  req: Request<
    GetCreatureByIdReqParams,
    unknown,
    unknown,
    GetCreatureByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { creatureId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesCreature = await CreaturesRepository.getByUserIdAndSeriesId(
        parseInt(creatureId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesCreature) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Creature by id and series id fetched.',
        data: {
          id: seriesCreature.id,
          name: seriesCreature?.name,
          physicalDescription: seriesCreature?.physicalDescription,
          personalityDescription: seriesCreature?.personalityDescription,
        },
      });
    }

    if (bookId) {
      const bookCreature = await CreaturesRepository.getByUserIdAndBookId(
        parseInt(creatureId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookCreature) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Creature by id and book id fetched.',
        data: {
          id: bookCreature.id,
          name: bookCreature?.name,
          physicalDescription: bookCreature?.physicalDescription,
          personalityDescription: bookCreature?.personalityDescription,
        },
      });
    }

    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

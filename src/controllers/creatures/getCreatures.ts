import { Request, Response } from 'express';

import { CreaturesRepository } from '../../repositories/creatures';
import { HttpCode } from '../../types/httpCode';

export interface GetCreaturesReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getCreatures = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetCreaturesReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesCreatures =
        await CreaturesRepository.getAllByUserIdAndSeriesId(
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Creatures by user id and series id fetched.',
        data: seriesCreatures.map((creature) => ({
          id: creature.id,
          name: creature.name,
          physicalDescription: creature.physicalDescription,
          personalityDescription: creature.personalityDescription,
        })),
      });
    }

    if (bookId) {
      const bookCreatures = await CreaturesRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Creatures by user id and book id fetched.',
        data: bookCreatures.map((creature) => ({
          id: creature.id,
          name: creature.name,
          physicalDescription: creature.physicalDescription,
          personalityDescription: creature.personalityDescription,
        })),
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

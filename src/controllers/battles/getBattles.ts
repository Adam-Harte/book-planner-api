import { Request, Response } from 'express';

import { BattlesRepository } from '../../repositories/battles';
import { HttpCode } from '../../types/httpCode';

export interface GetBattlesReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getBattles = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetBattlesReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesBattles = await BattlesRepository.getAllByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Battles by user id and series id fetched.',
        data: seriesBattles.map((battle) => ({
          id: battle.id,
          name: battle.name,
          start: battle.start,
          end: battle.end,
          description: battle.description,
        })),
      });
    }

    if (bookId) {
      const bookBattles = await BattlesRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Battles by user id and book id fetched.',
        data: bookBattles.map((battle) => ({
          id: battle.id,
          name: battle.name,
          start: battle.start,
          end: battle.end,
          description: battle.description,
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

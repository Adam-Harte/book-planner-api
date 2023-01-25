import { Request, Response } from 'express';

import { BattlesRepository } from '../../repositories/battles';
import { HttpCode } from '../../types/httpCode';

export interface GetBattleByIdReqParams {
  battleId: string;
}

export interface GetBattleByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getBattleById = async (
  req: Request<
    GetBattleByIdReqParams,
    unknown,
    unknown,
    GetBattleByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { battleId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesBattle = await BattlesRepository.getByUserIdAndSeriesId(
        parseInt(battleId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesBattle) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Battle by id and series id fetched.',
        data: {
          id: seriesBattle.id,
          name: seriesBattle.name,
          start: seriesBattle.start,
          end: seriesBattle.end,
          description: seriesBattle.description,
        },
      });
    }

    if (bookId) {
      const bookBattle = await BattlesRepository.getByUserIdAndBookId(
        parseInt(battleId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookBattle) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Battle by id and book id fetched.',
        data: {
          id: bookBattle.id,
          name: bookBattle.name,
          start: bookBattle.start,
          end: bookBattle.end,
          description: bookBattle.description,
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

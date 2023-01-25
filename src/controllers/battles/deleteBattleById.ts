import { Request, Response } from 'express';

import { BattlesRepository } from '../../repositories/battles';
import { HttpCode } from '../../types/httpCode';

export interface DeleteBattleReqParams {
  battleId: string;
}

export interface DeleteBattleReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteBattleById = async (
  req: Request<
    DeleteBattleReqParams,
    unknown,
    unknown,
    DeleteBattleReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { battleId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesBattle;
    let bookBattle;

    if (seriesId) {
      seriesBattle = await BattlesRepository.getByUserIdAndSeriesId(
        parseInt(battleId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookBattle = await BattlesRepository.getByUserIdAndBookId(
        parseInt(battleId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesBattle && !bookBattle) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await BattlesRepository.delete(parseInt(battleId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Battle deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

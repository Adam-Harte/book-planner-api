import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { BattlesRepository } from '../../repositories/battles';
import { HttpCode } from '../../types/httpCode';

export interface UpdateBattleReqParams {
  battleId: string;
}

export interface UpdateBattleReqBody {
  updatedData: {
    name?: string;
    start?: string;
    end?: string;
    description?: string;
  };
}

export interface UpdateBattleReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateBattleById = async (
  req: Request<
    UpdateBattleReqParams,
    unknown,
    UpdateBattleReqBody,
    UpdateBattleReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { battleId } = req.params;
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

    const updatedBattle = {
      ...seriesBattle,
      ...bookBattle,
      ...updatedData,
    };

    const { id, name, start, end, description } = await BattlesRepository.save(
      updatedBattle
    );

    return res.status(HttpCode.OK).json({
      message: 'Battle updated.',
      data: {
        id,
        name,
        start,
        end,
        description,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

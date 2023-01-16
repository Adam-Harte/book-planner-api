import { Request, Response } from 'express';

import { MagicSystemsRepository } from '../../repositories/magicSystems';
import { HttpCode } from '../../types/httpCode';

export interface DeleteMagicSystemReqParams {
  magicSystemId: string;
}

export interface DeleteMagicSystemReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteMagicSystemById = async (
  req: Request<
    DeleteMagicSystemReqParams,
    unknown,
    unknown,
    DeleteMagicSystemReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { magicSystemId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesMagicSystem;
    let bookMagicSystem;

    if (seriesId) {
      seriesMagicSystem = await MagicSystemsRepository.getByUserIdAndSeriesId(
        parseInt(magicSystemId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookMagicSystem = await MagicSystemsRepository.getByUserIdAndBookId(
        parseInt(magicSystemId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesMagicSystem && !bookMagicSystem) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await MagicSystemsRepository.delete(parseInt(magicSystemId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Magic System deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

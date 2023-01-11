import { Request, Response } from 'express';

import { WorldsRepository } from '../../repositories/worlds';
import { HttpCode } from '../../types/httpCode';

export interface DeleteWorldReqParams {
  worldId: string;
}

export interface DeleteWorldReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteWorldById = async (
  req: Request<
    DeleteWorldReqParams,
    unknown,
    unknown,
    DeleteWorldReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { worldId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesWorld;
    let bookWorld;

    if (seriesId) {
      seriesWorld = await WorldsRepository.getByUserIdAndSeriesId(
        parseInt(worldId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookWorld = await WorldsRepository.getByUserIdAndBookId(
        parseInt(worldId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesWorld && !bookWorld) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await WorldsRepository.delete(parseInt(worldId, 10));

    return res.status(HttpCode.OK).json({
      message: 'World deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

import { Request, Response } from 'express';

import { WorldsRepository } from '../../repositories/worlds';
import { HttpCode } from '../../types/httpCode';

export interface GetWorldByIdReqParams {
  worldId: string;
}

export interface GetWorldByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getWorldById = async (
  req: Request<
    GetWorldByIdReqParams,
    unknown,
    unknown,
    GetWorldByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { worldId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesWorld = await WorldsRepository.getByUserIdAndSeriesId(
        parseInt(worldId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesWorld) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'World by id and series id fetched.',
        data: {
          id: seriesWorld.id,
          name: seriesWorld.name,
          description: seriesWorld.description,
        },
      });
    }

    if (bookId) {
      const bookWorld = await WorldsRepository.getByUserIdAndBookId(
        parseInt(worldId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookWorld) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'World by id and book id fetched.',
        data: {
          id: bookWorld.id,
          name: bookWorld.name,
          description: bookWorld.description,
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

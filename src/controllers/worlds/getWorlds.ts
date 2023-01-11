import { Request, Response } from 'express';

import { WorldsRepository } from '../../repositories/worlds';
import { HttpCode } from '../../types/httpCode';

export interface GetWorldsReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getWorlds = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetWorldsReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesWorlds = await WorldsRepository.getAllByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Worlds by user id and series id fetched.',
        data: seriesWorlds.map((world) => ({
          id: world.id,
          name: world.name,
          description: world.description,
        })),
      });
    }

    if (bookId) {
      const bookWorlds = await WorldsRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Worlds by user id and book id fetched.',
        data: bookWorlds.map((world) => ({
          id: world.id,
          name: world.name,
          description: world.description,
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

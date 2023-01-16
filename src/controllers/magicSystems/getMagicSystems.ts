import { Request, Response } from 'express';

import { MagicSystemsRepository } from '../../repositories/magicSystems';
import { HttpCode } from '../../types/httpCode';

export interface GetMagicSystemsReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getMagicSystems = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetMagicSystemsReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesMagicSystems =
        await MagicSystemsRepository.getAllByUserIdAndSeriesId(
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Magic Systems by user id and series id fetched.',
        data: seriesMagicSystems.map((magicSystem) => ({
          id: magicSystem.id,
          name: magicSystem.name,
          description: magicSystem.description,
          rules: magicSystem.rules,
        })),
      });
    }

    if (bookId) {
      const bookMagicSystems =
        await MagicSystemsRepository.getAllByUserIdAndBookId(
          parseInt(req.userId as string, 10),
          parseInt(bookId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Magic Systems by user id and book id fetched.',
        data: bookMagicSystems.map((magicSystem) => ({
          id: magicSystem.id,
          name: magicSystem.name,
          description: magicSystem.description,
          rules: magicSystem.rules,
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

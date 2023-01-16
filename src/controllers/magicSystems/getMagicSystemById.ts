import { Request, Response } from 'express';

import { MagicSystemsRepository } from '../../repositories/magicSystems';
import { HttpCode } from '../../types/httpCode';

export interface GetMagicSystemByIdReqParams {
  magicSystemId: string;
}

export interface GetMagicSystemByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getMagicSystemById = async (
  req: Request<
    GetMagicSystemByIdReqParams,
    unknown,
    unknown,
    GetMagicSystemByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { magicSystemId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesMagicSystem =
        await MagicSystemsRepository.getByUserIdAndSeriesId(
          parseInt(magicSystemId as string, 10),
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      if (!seriesMagicSystem) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Magic System by id and series id fetched.',
        data: {
          id: seriesMagicSystem.id,
          name: seriesMagicSystem.name,
          description: seriesMagicSystem.description,
          rules: seriesMagicSystem.rules,
        },
      });
    }

    if (bookId) {
      const bookMagicSystem = await MagicSystemsRepository.getByUserIdAndBookId(
        parseInt(magicSystemId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookMagicSystem) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Magic System by id and book id fetched.',
        data: {
          id: bookMagicSystem.id,
          name: bookMagicSystem.name,
          description: bookMagicSystem.description,
          rules: bookMagicSystem.rules,
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

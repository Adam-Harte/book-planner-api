import { Request, Response } from 'express';

import { WeaponsRepository } from '../../repositories/weapons';
import { HttpCode } from '../../types/httpCode';

export interface GetWeaponsReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getWeapons = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetWeaponsReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesWeapons = await WeaponsRepository.getAllByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Weapons by user id and series id fetched.',
        data: seriesWeapons.map((weapon) => ({
          id: weapon.id,
          name: weapon.name,
          description: weapon.description,
          creator: weapon.creator,
          wielder: weapon.wielder,
          forged: weapon.forged,
        })),
      });
    }

    if (bookId) {
      const bookWeapons = await WeaponsRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Weapons by user id and book id fetched.',
        data: bookWeapons.map((weapon) => ({
          id: weapon.id,
          name: weapon.name,
          description: weapon.description,
          creator: weapon.creator,
          wielder: weapon.wielder,
          forged: weapon.forged,
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

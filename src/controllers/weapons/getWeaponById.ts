import { Request, Response } from 'express';

import { WeaponsRepository } from '../../repositories/weapons';
import { HttpCode } from '../../types/httpCode';

export interface GetWeaponByIdReqParams {
  weaponId: string;
}

export interface GetWeaponByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getWeaponById = async (
  req: Request<
    GetWeaponByIdReqParams,
    unknown,
    unknown,
    GetWeaponByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { weaponId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesWeapon = await WeaponsRepository.getByUserIdAndSeriesId(
        parseInt(weaponId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesWeapon) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Weapon by id and series id fetched.',
        data: {
          id: seriesWeapon.id,
          name: seriesWeapon.name,
          description: seriesWeapon.description,
          creator: seriesWeapon.creator,
          wielder: seriesWeapon.wielder,
          forged: seriesWeapon.forged,
        },
      });
    }

    if (bookId) {
      const bookWeapon = await WeaponsRepository.getByUserIdAndBookId(
        parseInt(weaponId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookWeapon) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Weapon by id and book id fetched.',
        data: {
          id: bookWeapon.id,
          name: bookWeapon.name,
          description: bookWeapon.description,
          creator: bookWeapon.creator,
          wielder: bookWeapon.wielder,
          forged: bookWeapon.forged,
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

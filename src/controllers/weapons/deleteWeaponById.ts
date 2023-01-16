import { Request, Response } from 'express';

import { WeaponsRepository } from '../../repositories/weapons';
import { HttpCode } from '../../types/httpCode';

export interface DeleteWeaponReqParams {
  weaponId: string;
}

export interface DeleteWeaponReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteWeaponById = async (
  req: Request<
    DeleteWeaponReqParams,
    unknown,
    unknown,
    DeleteWeaponReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { weaponId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesWeapon;
    let bookWeapon;

    if (seriesId) {
      seriesWeapon = await WeaponsRepository.getByUserIdAndSeriesId(
        parseInt(weaponId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookWeapon = await WeaponsRepository.getByUserIdAndBookId(
        parseInt(weaponId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesWeapon && !bookWeapon) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await WeaponsRepository.delete(parseInt(weaponId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Weapon deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

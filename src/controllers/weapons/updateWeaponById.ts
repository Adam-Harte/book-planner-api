import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { WeaponsRepository } from '../../repositories/weapons';
import { HttpCode } from '../../types/httpCode';

export interface UpdateWeaponReqParams {
  weaponId: string;
}

export interface UpdateWeaponReqBody {
  updatedData: {
    name?: string;
    description?: string;
    creator?: string;
    wielder?: string;
    forged?: string;
  };
}

export interface UpdateWeaponReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateWeaponById = async (
  req: Request<
    UpdateWeaponReqParams,
    unknown,
    UpdateWeaponReqBody,
    UpdateWeaponReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { weaponId } = req.params;
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

    const updatedWeapon = {
      ...seriesWeapon,
      ...bookWeapon,
      ...updatedData,
    };

    const { id, name, description, creator, wielder, forged } =
      await WeaponsRepository.save(updatedWeapon);

    return res.status(HttpCode.OK).json({
      message: 'Weapon updated.',
      data: {
        id,
        name,
        description,
        creator,
        wielder,
        forged,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

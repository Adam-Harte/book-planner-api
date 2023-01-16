import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { BooksRepository } from '../../repositories/books';
import { SeriesRepository } from '../../repositories/series';
import { WeaponsRepository } from '../../repositories/weapons';
import { HttpCode } from '../../types/httpCode';

export interface CreateWeaponReqBody {
  name: string;
  description?: string;
  creator?: string;
  wielder?: string;
  forged?: string;
}

export interface CreateWeaponReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createWeapon = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateWeaponReqBody,
    CreateWeaponReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, description, creator, wielder, forged } = req.body;
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

    let series;
    let book;

    if (seriesId) {
      series = await SeriesRepository.getByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId, 10)
      );
    }

    if (bookId) {
      book = await BooksRepository.getByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId, 10)
      );
    }

    if (!series && !book) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'A weapon must be created belonging to one of your series or books.',
      });
    }

    const weapon = await WeaponsRepository.create({
      name,
      description,
      creator,
      wielder,
      forged,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      name: dataName,
      description: dataDescription,
      creator: dataCreator,
      wielder: dataWielder,
      forged: dataForged,
    } = await WeaponsRepository.save(weapon);

    return res.status(HttpCode.CREATED).json({
      message: 'Weapon created.',
      data: {
        id,
        name: dataName,
        description: dataDescription,
        creator: dataCreator,
        wielder: dataWielder,
        forged: dataForged,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

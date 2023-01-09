import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { SettingType, SizeMetric } from '../../models/types/enums';
import { BooksRepository } from '../../repositories/books';
import { SeriesRepository } from '../../repositories/series';
import { SettingsRepository } from '../../repositories/settings';
import { HttpCode } from '../../types/httpCode';

export interface CreateSettingReqBody {
  name: string;
  description?: string;
  type: SettingType;
  size?: number;
  sizeMetric?: SizeMetric;
  image?: string;
}

export interface CreateSettingReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createSetting = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateSettingReqBody,
    CreateSettingReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, description, type } = req.body;
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
          'A setting must be created belonging to one of your series or books.',
      });
    }

    const setting = await SettingsRepository.create({
      name,
      description,
      type,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      name: dataName,
      description: dataDescription,
      type: dataType,
    } = await SettingsRepository.save(setting);

    return res.status(HttpCode.CREATED).json({
      message: 'Setting created.',
      data: {
        id,
        name: dataName,
        description: dataDescription,
        type: dataType,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

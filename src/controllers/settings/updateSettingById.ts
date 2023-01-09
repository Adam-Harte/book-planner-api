import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { SettingType } from '../../models/types/enums';
import { SettingsRepository } from '../../repositories/settings';
import { HttpCode } from '../../types/httpCode';

export interface UpdateSettingReqParams {
  settingId: string;
}

export interface UpdateSettingReqBody {
  updatedData: {
    name?: string;
    description?: string;
    type?: SettingType;
  };
}

export interface UpdateSettingReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateSettingById = async (
  req: Request<
    UpdateSettingReqParams,
    unknown,
    UpdateSettingReqBody,
    UpdateSettingReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { settingId } = req.params;
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

    let seriesSetting;
    let bookSetting;

    if (seriesId) {
      seriesSetting = await SettingsRepository.getByUserIdAndSeriesId(
        parseInt(settingId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookSetting = await SettingsRepository.getByUserIdAndBookId(
        parseInt(settingId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesSetting && !bookSetting) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    const updatedSetting = {
      ...seriesSetting,
      ...bookSetting,
      ...updatedData,
    };

    const { id, name, description, type } = await SettingsRepository.save(
      updatedSetting
    );

    return res.status(HttpCode.OK).json({
      message: 'Setting updated.',
      data: {
        id,
        name,
        description,
        type,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

import { Request, Response } from 'express';

import { SettingsRepository } from '../../repositories/settings';
import { HttpCode } from '../../types/httpCode';

export interface DeleteSettingReqParams {
  settingId: string;
}

export interface DeleteSettingReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteSettingById = async (
  req: Request<
    DeleteSettingReqParams,
    unknown,
    unknown,
    DeleteSettingReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { settingId } = req.params;
  const { seriesId, bookId } = req.query;

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

    await SettingsRepository.delete(parseInt(settingId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Setting deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

import { Request, Response } from 'express';

import { SettingsRepository } from '../../repositories/settings';
import { HttpCode } from '../../types/httpCode';

export interface GetSettingByIdReqParams {
  settingId: string;
}

export interface GetSettingByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getSettingById = async (
  req: Request<
    GetSettingByIdReqParams,
    unknown,
    unknown,
    GetSettingByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { settingId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesSetting = await SettingsRepository.getByUserIdAndSeriesId(
        parseInt(settingId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesSetting) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Setting by id and series id fetched.',
        data: {
          id: seriesSetting.id,
          name: seriesSetting.name,
          description: seriesSetting.description,
          type: seriesSetting.type,
        },
      });
    }

    if (bookId) {
      const bookSetting = await SettingsRepository.getByUserIdAndBookId(
        parseInt(settingId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookSetting) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Setting by id and book id fetched.',
        data: {
          id: bookSetting.id,
          name: bookSetting.name,
          description: bookSetting.description,
          type: bookSetting.type,
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

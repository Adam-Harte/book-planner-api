import { Request, Response } from 'express';

import { SettingsRepository } from '../../repositories/settings';
import { HttpCode } from '../../types/httpCode';

export interface GetSettingsReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getSettings = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetSettingsReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesSettings = await SettingsRepository.getAllByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Settings by user id and series id fetched.',
        data: seriesSettings.map((setting) => ({
          id: setting.id,
          name: setting.name,
          description: setting.description,
          type: setting.type,
        })),
      });
    }

    if (bookId) {
      const bookSettings = await SettingsRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Settings by user id and book id fetched.',
        data: bookSettings.map((setting) => ({
          id: setting.id,
          name: setting.name,
          description: setting.description,
          type: setting.type,
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

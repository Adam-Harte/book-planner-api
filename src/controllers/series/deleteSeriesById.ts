import { Request, Response } from 'express';

import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface DeleteSeriesReqParams {
  seriesId: string;
}

export const deleteSeriesById = async (
  req: Request<
    DeleteSeriesReqParams,
    unknown,
    unknown,
    unknown,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId } = req.params;

  try {
    const series = await SeriesRepository.getByUserIdAndSeriesId(
      parseInt(req.userId as string, 10),
      parseInt(seriesId, 10)
    );

    if (!series) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await SeriesRepository.delete(parseInt(seriesId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Series deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

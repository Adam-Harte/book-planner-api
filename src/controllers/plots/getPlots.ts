import { Request, Response } from 'express';

import { PlotsRepository } from '../../repositories/plots';
import { HttpCode } from '../../types/httpCode';

export interface GetPlotsReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getPlots = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetPlotsReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesPlots = await PlotsRepository.getAllByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Plots by user id and series id fetched.',
        data: seriesPlots.map((plot) => ({
          id: plot.id,
          name: plot.name,
          type: plot.type,
          description: plot.description,
        })),
      });
    }

    if (bookId) {
      const bookPlots = await PlotsRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Plots by user id and book id fetched.',
        data: bookPlots.map((plot) => ({
          id: plot.id,
          name: plot.name,
          type: plot.type,
          description: plot.description,
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

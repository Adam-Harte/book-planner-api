import { Request, Response } from 'express';

import { PlotsRepository } from '../../repositories/plots';
import { HttpCode } from '../../types/httpCode';

export interface GetPlotByIdReqParams {
  plotId: string;
}

export interface GetPlotByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getPlotById = async (
  req: Request<
    GetPlotByIdReqParams,
    unknown,
    unknown,
    GetPlotByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { plotId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesPlot = await PlotsRepository.getByUserIdAndSeriesId(
        parseInt(plotId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesPlot) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Plot by id and series id fetched.',
        data: {
          id: seriesPlot.id,
          name: seriesPlot.name,
          type: seriesPlot.type,
          description: seriesPlot.description,
        },
      });
    }

    if (bookId) {
      const bookPlot = await PlotsRepository.getByUserIdAndBookId(
        parseInt(plotId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookPlot) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Plot by id and book id fetched.',
        data: {
          id: bookPlot.id,
          name: bookPlot.name,
          type: bookPlot.type,
          description: bookPlot.description,
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

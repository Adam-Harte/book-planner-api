import { Request, Response } from 'express';

import { PlotsRepository } from '../../repositories/plots';
import { HttpCode } from '../../types/httpCode';

export interface DeletePlotReqParams {
  plotId: string;
}

export interface DeletePlotReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deletePlotById = async (
  req: Request<
    DeletePlotReqParams,
    unknown,
    unknown,
    DeletePlotReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { plotId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesPlot;
    let bookPlot;

    if (seriesId) {
      seriesPlot = await PlotsRepository.getByUserIdAndSeriesId(
        parseInt(plotId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookPlot = await PlotsRepository.getByUserIdAndBookId(
        parseInt(plotId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesPlot && !bookPlot) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await PlotsRepository.delete(parseInt(plotId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Plot deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

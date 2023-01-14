import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { PlotType } from '../../models/types/enums';
import { PlotsRepository } from '../../repositories/plots';
import { HttpCode } from '../../types/httpCode';

export interface UpdatePlotReqParams {
  plotId: string;
}

export interface UpdatePlotReqBody {
  updatedData: {
    name?: string;
    type?: PlotType;
    description?: string;
  };
}

export interface UpdatePlotReqQuery {
  seriesId: string;
  bookId: string;
}

export const updatePlotById = async (
  req: Request<
    UpdatePlotReqParams,
    unknown,
    UpdatePlotReqBody,
    UpdatePlotReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { plotId } = req.params;
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

    const updatedPlot = {
      ...seriesPlot,
      ...bookPlot,
      ...updatedData,
    };

    const { id, name, type, description } = await PlotsRepository.save(
      updatedPlot
    );

    return res.status(HttpCode.OK).json({
      message: 'Plot updated.',
      data: {
        id,
        name,
        type,
        description,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

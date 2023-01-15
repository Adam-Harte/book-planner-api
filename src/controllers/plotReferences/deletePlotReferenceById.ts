import { Request, Response } from 'express';

import { PlotReferencesRepository } from '../../repositories/plotReferences';
import { HttpCode } from '../../types/httpCode';

export interface DeletePlotReferenceReqParams {
  plotReferenceId: string;
}

export interface DeletePlotReferenceReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deletePlotReferenceById = async (
  req: Request<
    DeletePlotReferenceReqParams,
    unknown,
    unknown,
    DeletePlotReferenceReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { plotReferenceId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesPlotReference;
    let bookPlotReference;

    if (seriesId) {
      seriesPlotReference =
        await PlotReferencesRepository.getByUserIdAndSeriesId(
          parseInt(plotReferenceId as string, 10),
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );
    }

    if (bookId) {
      bookPlotReference = await PlotReferencesRepository.getByUserIdAndBookId(
        parseInt(plotReferenceId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesPlotReference && !bookPlotReference) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await PlotReferencesRepository.delete(parseInt(plotReferenceId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Plot Reference deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

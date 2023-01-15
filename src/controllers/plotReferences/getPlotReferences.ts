import { Request, Response } from 'express';

import { PlotReferencesRepository } from '../../repositories/plotReferences';
import { HttpCode } from '../../types/httpCode';

export interface GetPlotReferencesReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getPlotReferences = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetPlotReferencesReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesPlotReferences =
        await PlotReferencesRepository.getAllByUserIdAndSeriesId(
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Plot References by user id and series id fetched.',
        data: seriesPlotReferences.map((plotReference) => ({
          id: plotReference.id,
          name: plotReference.name,
          type: plotReference.type,
          referenceId: plotReference.referenceId,
        })),
      });
    }

    if (bookId) {
      const bookPlotReferences =
        await PlotReferencesRepository.getAllByUserIdAndBookId(
          parseInt(req.userId as string, 10),
          parseInt(bookId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Plot References by user id and book id fetched.',
        data: bookPlotReferences.map((plotReference) => ({
          id: plotReference.id,
          name: plotReference.name,
          type: plotReference.type,
          referenceId: plotReference.referenceId,
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

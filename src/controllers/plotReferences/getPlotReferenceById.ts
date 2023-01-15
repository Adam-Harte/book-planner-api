import { Request, Response } from 'express';

import { PlotReferencesRepository } from '../../repositories/plotReferences';
import { HttpCode } from '../../types/httpCode';

export interface GetPlotReferenceByIdReqParams {
  plotReferenceId: string;
}

export interface GetPlotReferenceByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getPlotReferenceById = async (
  req: Request<
    GetPlotReferenceByIdReqParams,
    unknown,
    unknown,
    GetPlotReferenceByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { plotReferenceId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesPlotReference =
        await PlotReferencesRepository.getByUserIdAndSeriesId(
          parseInt(plotReferenceId as string, 10),
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      if (!seriesPlotReference) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Plot Reference by id and series id fetched.',
        data: {
          id: seriesPlotReference.id,
          name: seriesPlotReference.name,
          type: seriesPlotReference.type,
          referenceId: seriesPlotReference?.referenceId,
        },
      });
    }

    if (bookId) {
      const bookPlotReference =
        await PlotReferencesRepository.getByUserIdAndBookId(
          parseInt(plotReferenceId as string, 10),
          parseInt(req.userId as string, 10),
          parseInt(bookId as string, 10)
        );

      if (!bookPlotReference) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Plot Reference by id and book id fetched.',
        data: {
          id: bookPlotReference.id,
          name: bookPlotReference.name,
          type: bookPlotReference.type,
          referenceId: bookPlotReference.referenceId,
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

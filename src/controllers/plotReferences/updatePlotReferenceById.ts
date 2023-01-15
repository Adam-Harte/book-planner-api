import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { PlotReferenceType } from '../../models/types/enums';
import { PlotReferencesRepository } from '../../repositories/plotReferences';
import { HttpCode } from '../../types/httpCode';

export interface UpdatePlotReferenceReqParams {
  plotReferenceId: string;
}

export interface UpdatePlotReferenceReqBody {
  updatedData: {
    name?: string;
    type?: PlotReferenceType;
    referenceId?: number;
  };
}

export interface UpdatePlotReferenceReqQuery {
  seriesId: string;
  bookId: string;
}

export const updatePlotReferenceById = async (
  req: Request<
    UpdatePlotReferenceReqParams,
    unknown,
    UpdatePlotReferenceReqBody,
    UpdatePlotReferenceReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { plotReferenceId } = req.params;
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

    const updatedPlotReference = {
      ...seriesPlotReference,
      ...bookPlotReference,
      ...updatedData,
    };

    const { id, name, type, referenceId } = await PlotReferencesRepository.save(
      updatedPlotReference
    );

    return res.status(HttpCode.OK).json({
      message: 'Plot Reference updated.',
      data: {
        id,
        name,
        type,
        referenceId,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

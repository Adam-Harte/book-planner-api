import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { PlotReferenceType } from '../../models/types/enums';
import { BooksRepository } from '../../repositories/books';
import { PlotReferencesRepository } from '../../repositories/plotReferences';
import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface CreatePlotReferenceReqBody {
  name: string;
  type?: PlotReferenceType;
  referenceId?: number;
}

export interface CreatePlotReferenceReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createPlotReference = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreatePlotReferenceReqBody,
    CreatePlotReferenceReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, type, referenceId } = req.body;
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

    let series;
    let book;

    if (seriesId) {
      series = await SeriesRepository.getByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId, 10)
      );
    }

    if (bookId) {
      book = await BooksRepository.getByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId, 10)
      );
    }

    if (!series && !book) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'A plot reference must be created belonging to one of your series or books.',
      });
    }

    const plotReference = await PlotReferencesRepository.create({
      name,
      type,
      referenceId,
      ...(series && { series }),
      ...(book && { book }),
    });
    const {
      id,
      name: dataName,
      type: dataType,
      referenceId: dataReferenceId,
    } = await PlotReferencesRepository.save(plotReference);

    return res.status(HttpCode.CREATED).json({
      message: 'Plot Reference created.',
      data: {
        id,
        name: dataName,
        type: dataType,
        referenceId: dataReferenceId,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

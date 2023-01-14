import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { PlotType } from '../../models/types/enums';
import { BooksRepository } from '../../repositories/books';
import { PlotsRepository } from '../../repositories/plots';
import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface CreatePlotReqBody {
  name: string;
  type?: PlotType;
  description?: string;
}

export interface CreatePlotReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createPlot = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreatePlotReqBody,
    CreatePlotReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { name, type, description } = req.body;
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
          'A plot must be created belonging to one of your series or books.',
      });
    }

    const plot = await PlotsRepository.create({
      name,
      type,
      description,
      ...(series && { series }),
      ...(book && { book }),
    });
    const {
      id,
      name: dataName,
      type: dataType,
      description: dataDescription,
    } = await PlotsRepository.save(plot);

    return res.status(HttpCode.CREATED).json({
      message: 'Plot created.',
      data: {
        id,
        name: dataName,
        type: dataType,
        description: dataDescription,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

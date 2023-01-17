import { Request, Response } from 'express';

import { TechnologiesRepository } from '../../repositories/technologies';
import { HttpCode } from '../../types/httpCode';

export interface DeleteTechnologyReqParams {
  technologyId: string;
}

export interface DeleteTechnologyReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteTechnologyById = async (
  req: Request<
    DeleteTechnologyReqParams,
    unknown,
    unknown,
    DeleteTechnologyReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { technologyId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesTechnology;
    let bookTechnology;

    if (seriesId) {
      seriesTechnology = await TechnologiesRepository.getByUserIdAndSeriesId(
        parseInt(technologyId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookTechnology = await TechnologiesRepository.getByUserIdAndBookId(
        parseInt(technologyId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesTechnology && !bookTechnology) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await TechnologiesRepository.delete(parseInt(technologyId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Technology deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

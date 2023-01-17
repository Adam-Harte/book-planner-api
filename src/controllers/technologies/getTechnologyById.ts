import { Request, Response } from 'express';

import { TechnologiesRepository } from '../../repositories/technologies';
import { HttpCode } from '../../types/httpCode';

export interface GetTechnologyByIdReqParams {
  technologyId: string;
}

export interface GetTechnologyByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getTechnologyById = async (
  req: Request<
    GetTechnologyByIdReqParams,
    unknown,
    unknown,
    GetTechnologyByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { technologyId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesTechnology =
        await TechnologiesRepository.getByUserIdAndSeriesId(
          parseInt(technologyId as string, 10),
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      if (!seriesTechnology) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Technology by id and series id fetched.',
        data: {
          id: seriesTechnology.id,
          name: seriesTechnology.name,
          description: seriesTechnology.description,
          inventor: seriesTechnology.inventor,
        },
      });
    }

    if (bookId) {
      const bookTechnology = await TechnologiesRepository.getByUserIdAndBookId(
        parseInt(technologyId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookTechnology) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Technology by id and book id fetched.',
        data: {
          id: bookTechnology.id,
          name: bookTechnology.name,
          description: bookTechnology.description,
          inventor: bookTechnology.inventor,
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

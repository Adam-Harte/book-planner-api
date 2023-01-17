import { Request, Response } from 'express';

import { TechnologiesRepository } from '../../repositories/technologies';
import { HttpCode } from '../../types/httpCode';

export interface GetTechnologiesReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getTechnologies = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetTechnologiesReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesTechnologies =
        await TechnologiesRepository.getAllByUserIdAndSeriesId(
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Technologies by user id and series id fetched.',
        data: seriesTechnologies.map((technology) => ({
          id: technology.id,
          name: technology.name,
          description: technology.description,
          inventor: technology.inventor,
        })),
      });
    }

    if (bookId) {
      const bookTechnologies =
        await TechnologiesRepository.getAllByUserIdAndBookId(
          parseInt(req.userId as string, 10),
          parseInt(bookId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Technologies by user id and book id fetched.',
        data: bookTechnologies.map((technology) => ({
          id: technology.id,
          name: technology.name,
          description: technology.description,
          inventor: technology.inventor,
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

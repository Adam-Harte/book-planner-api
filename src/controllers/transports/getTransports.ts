import { Request, Response } from 'express';

import { TransportsRepository } from '../../repositories/transports';
import { HttpCode } from '../../types/httpCode';

export interface GetTransportsReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getTransports = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetTransportsReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesTransports =
        await TransportsRepository.getAllByUserIdAndSeriesId(
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Transports by user id and series id fetched.',
        data: seriesTransports.map((transport) => ({
          id: transport.id,
          name: transport.name,
          description: transport.description,
        })),
      });
    }

    if (bookId) {
      const bookTransports = await TransportsRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Transports by user id and book id fetched.',
        data: bookTransports.map((transport) => ({
          id: transport.id,
          name: transport.name,
          description: transport.description,
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

import { Request, Response } from 'express';

import { TransportsRepository } from '../../repositories/transports';
import { HttpCode } from '../../types/httpCode';

export interface GetTransportByIdReqParams {
  transportId: string;
}

export interface GetTransportByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getTransportById = async (
  req: Request<
    GetTransportByIdReqParams,
    unknown,
    unknown,
    GetTransportByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { transportId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesTransport = await TransportsRepository.getByUserIdAndSeriesId(
        parseInt(transportId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesTransport) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Transport by id and series id fetched.',
        data: {
          id: seriesTransport.id,
          name: seriesTransport.name,
          description: seriesTransport.description,
        },
      });
    }

    if (bookId) {
      const bookTransport = await TransportsRepository.getByUserIdAndBookId(
        parseInt(transportId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookTransport) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Transport by id and book id fetched.',
        data: {
          id: bookTransport.id,
          name: bookTransport.name,
          description: bookTransport.description,
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

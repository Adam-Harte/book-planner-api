import { Request, Response } from 'express';

import { TransportsRepository } from '../../repositories/transports';
import { HttpCode } from '../../types/httpCode';

export interface DeleteTransportReqParams {
  transportId: string;
}

export interface DeleteTransportReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteTransportById = async (
  req: Request<
    DeleteTransportReqParams,
    unknown,
    unknown,
    DeleteTransportReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { transportId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesTransport;
    let bookTransport;

    if (seriesId) {
      seriesTransport = await TransportsRepository.getByUserIdAndSeriesId(
        parseInt(transportId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookTransport = await TransportsRepository.getByUserIdAndBookId(
        parseInt(transportId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesTransport && !bookTransport) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await TransportsRepository.delete(parseInt(transportId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Transport deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { TransportsRepository } from '../../repositories/transports';
import { HttpCode } from '../../types/httpCode';

export interface UpdateTransportReqParams {
  transportId: string;
}

export interface UpdateTransportReqBody {
  updatedData: {
    name?: string;
    description?: string;
  };
}

export interface UpdateTransportReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateTransportById = async (
  req: Request<
    UpdateTransportReqParams,
    unknown,
    UpdateTransportReqBody,
    UpdateTransportReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { transportId } = req.params;
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

    const updatedTransport = {
      ...seriesTransport,
      ...bookTransport,
      ...updatedData,
    };

    const { id, name, description } = await TransportsRepository.save(
      updatedTransport
    );

    return res.status(HttpCode.OK).json({
      message: 'Transport updated.',
      data: {
        id,
        name,
        description,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

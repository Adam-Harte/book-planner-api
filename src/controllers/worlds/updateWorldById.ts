import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { WorldsRepository } from '../../repositories/worlds';
import { HttpCode } from '../../types/httpCode';

export interface UpdateWorldReqParams {
  worldId: string;
}

export interface UpdateWorldReqBody {
  updatedData: {
    name?: string;
    description?: string;
  };
}

export interface UpdateWorldReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateWorldById = async (
  req: Request<
    UpdateWorldReqParams,
    unknown,
    UpdateWorldReqBody,
    UpdateWorldReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { worldId } = req.params;
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

    let seriesWorld;
    let bookWorld;

    if (seriesId) {
      seriesWorld = await WorldsRepository.getByUserIdAndSeriesId(
        parseInt(worldId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookWorld = await WorldsRepository.getByUserIdAndBookId(
        parseInt(worldId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesWorld && !bookWorld) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    const updatedWorld = {
      ...seriesWorld,
      ...bookWorld,
      ...updatedData,
    };

    const { id, name, description } = await WorldsRepository.save(updatedWorld);

    return res.status(HttpCode.OK).json({
      message: 'World updated.',
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

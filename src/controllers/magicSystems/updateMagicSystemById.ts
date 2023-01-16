import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { MagicSystemsRepository } from '../../repositories/magicSystems';
import { HttpCode } from '../../types/httpCode';

export interface UpdateMagicSystemReqParams {
  magicSystemId: string;
}

export interface UpdateMagicSystemReqBody {
  updatedData: {
    name?: string;
    description?: string;
    rules?: string;
  };
}

export interface UpdateMagicSystemReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateMagicSystemById = async (
  req: Request<
    UpdateMagicSystemReqParams,
    unknown,
    UpdateMagicSystemReqBody,
    UpdateMagicSystemReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { magicSystemId } = req.params;
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

    let seriesMagicSystem;
    let bookMagicSystem;

    if (seriesId) {
      seriesMagicSystem = await MagicSystemsRepository.getByUserIdAndSeriesId(
        parseInt(magicSystemId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookMagicSystem = await MagicSystemsRepository.getByUserIdAndBookId(
        parseInt(magicSystemId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesMagicSystem && !bookMagicSystem) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    const updatedMagicSystem = {
      ...seriesMagicSystem,
      ...bookMagicSystem,
      ...updatedData,
    };

    const { id, name, description, rules } = await MagicSystemsRepository.save(
      updatedMagicSystem
    );

    return res.status(HttpCode.OK).json({
      message: 'Magic System updated.',
      data: {
        id,
        name,
        description,
        rules,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { TechnologiesRepository } from '../../repositories/technologies';
import { HttpCode } from '../../types/httpCode';

export interface UpdateTechnologyReqParams {
  technologyId: string;
}

export interface UpdateTechnologyReqBody {
  updatedData: {
    name?: string;
    description?: string;
    inventor?: string;
  };
}

export interface UpdateTechnologyReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateTechnologyById = async (
  req: Request<
    UpdateTechnologyReqParams,
    unknown,
    UpdateTechnologyReqBody,
    UpdateTechnologyReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { technologyId } = req.params;
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

    const updatedWeapon = {
      ...seriesTechnology,
      ...bookTechnology,
      ...updatedData,
    };

    const { id, name, description, inventor } =
      await TechnologiesRepository.save(updatedWeapon);

    return res.status(HttpCode.OK).json({
      message: 'Technology updated.',
      data: {
        id,
        name,
        description,
        inventor,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

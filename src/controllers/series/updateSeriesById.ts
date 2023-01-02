import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export const updateSeriesById = async (req: Request, res: Response) => {
  const { seriesId } = req.params;
  const { updatedData } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

  try {
    const series = await SeriesRepository.getByUserIdAndSeriesId(
      parseInt(req.userId as string, 10),
      parseInt(seriesId, 10)
    );

    if (!series) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    const updatedSeries = {
      ...series,
      ...updatedData,
    };

    const { id, name, genre } = await SeriesRepository.save(updatedSeries);

    return res.status(HttpCode.OK).json({
      message: 'Series updated.',
      data: {
        id,
        name,
        genre,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

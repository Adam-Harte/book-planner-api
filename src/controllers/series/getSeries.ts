import { Request, Response } from 'express';

import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export const getSeries = async (req: Request, res: Response) => {
  try {
    const data = await SeriesRepository.getAllByUserId(
      parseInt(req.userId as string, 10)
    );

    return res.status(HttpCode.OK).json({
      message: 'Series by user id fetched.',
      data: data.map((series) => ({
        id: series.id,
        name: series.name,
        genre: series.genre,
      })),
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

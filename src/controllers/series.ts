import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { SeriesRepository } from '../repositories/series';
import { UsersRepository } from '../repositories/users';
import { HttpCode } from '../types/httpCode';

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

export const createSeries = async (req: Request, res: Response) => {
  const { name, genre } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

  try {
    const user = await UsersRepository.findOne({
      where: {
        id: parseInt(req.userId as string, 10),
      },
    });

    const series = await SeriesRepository.create({
      name,
      genre,
      ...(user && { user }),
    });
    const {
      id,
      name: dataName,
      genre: dataGenre,
    } = await SeriesRepository.save(series);

    return res.status(HttpCode.CREATED).json({
      message: 'Series created.',
      data: {
        id,
        name: dataName,
        genre: dataGenre,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

export const getSeriesById = async (req: Request, res: Response) => {
  const { seriesId } = req.params;

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

    return res.status(HttpCode.OK).json({
      message: 'Series by id fetched.',
      ...(series && {
        data: {
          id: series.id,
          name: series.name,
          genre: series.genre,
          books: series.books,
          settings: series.settings,
          worlds: series.worlds,
          characters: series.characters,
          plots: series.plots,
          plotReferences: series.plotReferences,
          magicSystems: series.magicSystems,
          weapons: series.weapons,
          technologies: series.technologies,
          transports: series.transports,
          battles: series.battles,
          groups: series.groups,
          creatures: series.creatures,
          races: series.races,
          languages: series.languages,
          songs: series.songs,
          families: series.families,
          governments: series.governments,
          religions: series.religions,
          gods: series.gods,
          artifacts: series.artifacts,
          legends: series.legends,
          histories: series.histories,
          maps: series.maps,
        },
      }),
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

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

export const deleteSeriesById = async (req: Request, res: Response) => {
  const { seriesId } = req.params;

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

    await SeriesRepository.delete(parseInt(seriesId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Series deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

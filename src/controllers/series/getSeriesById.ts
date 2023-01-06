import { Request, Response } from 'express';

import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface GetSeriesByIdReqParams {
  seriesId: string;
}

export const getSeriesById = async (
  req: Request<
    GetSeriesByIdReqParams,
    unknown,
    unknown,
    unknown,
    Record<string, any>
  >,
  res: Response
) => {
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

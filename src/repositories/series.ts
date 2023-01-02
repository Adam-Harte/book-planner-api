import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Series } from '../models/series';

export const getSeriesRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Series).extend({
    getAllByUserId(userId: number) {
      return this.find({
        where: {
          user: {
            id: userId,
          },
        },
      });
    },
    getByUserIdAndSeriesId(userId: number, seriesId: number, rel = false) {
      return this.findOne({
        relations: {
          books: rel,
          settings: rel,
          worlds: rel,
          characters: rel,
          plots: rel,
          plotReferences: rel,
          magicSystems: rel,
          weapons: rel,
          technologies: rel,
          transports: rel,
          battles: rel,
          groups: rel,
          creatures: rel,
          races: rel,
          languages: rel,
          songs: rel,
          families: rel,
          governments: rel,
          religions: rel,
          gods: rel,
          artifacts: rel,
          legends: rel,
          histories: rel,
          maps: rel,
        },
        where: {
          id: seriesId,
          user: {
            id: userId,
          },
        },
      });
    },
  });
};

export const SeriesRepository = getSeriesRepository(AppDataSource);

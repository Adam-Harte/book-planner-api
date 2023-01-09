import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Settings } from '../models/settings';

export const getSettingsRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Settings).extend({
    getAllByUserIdAndSeriesId(userId: number, seriesId: number) {
      return this.find({
        where: {
          series: {
            id: seriesId,
            user: {
              id: userId,
            },
          },
        },
      });
    },
    getAllByUserIdAndBookId(userId: number, bookId: number) {
      return this.find({
        where: {
          books: {
            id: bookId,
            user: {
              id: userId,
            },
          },
        },
      });
    },
    getByUserIdAndSeriesId(
      settingId: number,
      userId: number,
      seriesId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          world: rel,
          series: rel,
          artifacts: rel,
          battles: rel,
          books: rel,
          characters: rel,
          creatures: rel,
          families: rel,
          gods: rel,
          governments: rel,
          groups: rel,
          histories: rel,
          plots: rel,
          races: rel,
          religions: rel,
          technologies: rel,
          transports: rel,
        },
        where: {
          id: settingId,
          series: {
            id: seriesId,
            user: {
              id: userId,
            },
          },
        },
      });
    },
    getByUserIdAndBookId(
      settingId: number,
      userId: number,
      bookId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          world: rel,
          series: rel,
          artifacts: rel,
          battles: rel,
          books: rel,
          characters: rel,
          creatures: rel,
          families: rel,
          gods: rel,
          governments: rel,
          groups: rel,
          histories: rel,
          plots: rel,
          races: rel,
          religions: rel,
          technologies: rel,
          transports: rel,
        },
        where: {
          id: settingId,
          books: {
            id: bookId,
            user: {
              id: userId,
            },
          },
        },
      });
    },
  });
};

export const SettingsRepository = getSettingsRepository(AppDataSource);

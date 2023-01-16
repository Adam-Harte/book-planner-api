import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { MagicSystems } from '../models/magicSystems';

export const getMagicSystemsRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(MagicSystems).extend({
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
      magicSystemId: number,
      userId: number,
      seriesId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          books: rel,
          series: rel,
        },
        where: {
          id: magicSystemId,
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
      magicSystemId: number,
      userId: number,
      bookId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          books: rel,
          series: rel,
        },
        where: {
          id: magicSystemId,
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

export const MagicSystemsRepository = getMagicSystemsRepository(AppDataSource);

import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Battles } from '../models/battles';

export const getBattlesRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Battles).extend({
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
      battleId: number,
      userId: number,
      seriesId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          books: rel,
          series: rel,
          setting: rel,
        },
        where: {
          id: battleId,
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
      battleId: number,
      userId: number,
      bookId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          books: rel,
          series: rel,
          setting: rel,
        },
        where: {
          id: battleId,
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

export const BattlesRepository = getBattlesRepository(AppDataSource);

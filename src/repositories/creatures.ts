import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Creatures } from '../models/creatures';

export const getCreaturesRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Creatures).extend({
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
      creatureId: number,
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
          id: creatureId,
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
      creatureId: number,
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
          id: creatureId,
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

export const CreaturesRepository = getCreaturesRepository(AppDataSource);

import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Transports } from '../models/transports';

export const getTransportsRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Transports).extend({
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
      transportId: number,
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
          id: transportId,
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
      transportId: number,
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
          id: transportId,
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

export const TransportsRepository = getTransportsRepository(AppDataSource);

import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Plots } from '../models/plots';

export const getPlotsRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Plots).extend({
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
          book: {
            id: bookId,
            user: {
              id: userId,
            },
          },
        },
      });
    },
    getByUserIdAndSeriesId(
      plotId: number,
      userId: number,
      seriesId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          book: rel,
          series: rel,
          settings: rel,
          characters: rel,
          plotReferences: rel,
        },
        where: {
          id: plotId,
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
      plotId: number,
      userId: number,
      bookId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          book: rel,
          series: rel,
          settings: rel,
          characters: rel,
          plotReferences: rel,
        },
        where: {
          id: plotId,
          book: {
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

export const PlotsRepository = getPlotsRepository(AppDataSource);

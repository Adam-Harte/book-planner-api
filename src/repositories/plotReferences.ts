import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { PlotReferences } from '../models/plotReferences';

export const getPlotReferencesRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(PlotReferences).extend({
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
      plotReferenceId: number,
      userId: number,
      seriesId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          book: rel,
          series: rel,
          plots: rel,
        },
        where: {
          id: plotReferenceId,
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
      plotReferenceId: number,
      userId: number,
      bookId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          book: rel,
          series: rel,
          plots: rel,
        },
        where: {
          id: plotReferenceId,
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

export const PlotReferencesRepository =
  getPlotReferencesRepository(AppDataSource);

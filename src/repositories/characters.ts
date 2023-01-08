import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Characters } from '../models/characters';

export const getCharactersRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Characters).extend({
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
      characterId: number,
      userId: number,
      seriesId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          plots: rel,
          groups: rel,
          races: rel,
          family: rel,
        },
        where: {
          id: characterId,
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
      characterId: number,
      userId: number,
      bookId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          plots: rel,
          groups: rel,
          races: rel,
          family: rel,
        },
        where: {
          id: characterId,
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

export const CharactersRepository = getCharactersRepository(AppDataSource);

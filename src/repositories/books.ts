import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Books } from '../models/books';

export const getBooksRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Books).extend({
    getAllByUserId(userId: number) {
      return this.find({
        where: {
          user: {
            id: userId,
          },
        },
      });
    },
    getAllByUserIdAndSeriesId(userId: number, seriesId: number) {
      return this.find({
        where: {
          user: {
            id: userId,
          },
          series: {
            id: seriesId,
          },
        },
      });
    },
    getByUserIdAndBookId(userId: number, bookId: number, rel = false) {
      return this.findOne({
        relations: {
          settings: rel,
          worlds: rel,
          characters: rel,
          plots: rel,
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
          id: bookId,
          user: {
            id: userId,
          },
        },
      });
    },
  });
};

export const BooksRepository = getBooksRepository(AppDataSource);

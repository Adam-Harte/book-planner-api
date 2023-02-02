import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Groups } from '../models/groups';

export const getGroupsRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Groups).extend({
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
      groupId: number,
      userId: number,
      seriesId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          books: rel,
          series: rel,
          setting: rel,
          characters: rel,
        },
        where: {
          id: groupId,
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
      groupId: number,
      userId: number,
      bookId: number,
      rel = false
    ) {
      return this.findOne({
        relations: {
          books: rel,
          series: rel,
          setting: rel,
          characters: rel,
        },
        where: {
          id: groupId,
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

export const GroupsRepository = getGroupsRepository(AppDataSource);

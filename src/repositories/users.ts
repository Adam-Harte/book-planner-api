import { DataSource } from 'typeorm';

import { AppDataSource } from '../dataSource';
import { Users } from '../models/users';

export const getUsersRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(Users).extend({
    findByEmail(email: string) {
      return this.findOne({
        where: {
          email,
        },
      });
    },
  });
};

export const UsersRepository = getUsersRepository(AppDataSource);

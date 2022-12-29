import { AppDataSource } from '../dataSource';
import { Users } from '../models/users';

export const UsersRepository = AppDataSource.getRepository(Users).extend({
  findByEmail(email: string) {
    return this.findOne({
      where: {
        email,
      },
    });
  },
});

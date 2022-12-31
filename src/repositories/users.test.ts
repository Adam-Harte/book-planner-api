import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getUsersRepository } from './users';

describe('Users repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
    dbBackup = testDb.backup();
  });

  beforeEach(() => {
    dbBackup.restore();
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('returns a user found by matching email', async () => {
    const user = await usersRepository.create({
      username: 'test',
      email: 'test@test.com',
      password: 'testUser123!',
    });
    await usersRepository.save(user);

    const result = await usersRepository.findByEmail('test@test.com');

    expect(result).toEqual(user);
  });

  it('returns null if user not found by matching email', async () => {
    const user = await usersRepository.create({
      username: 'test',
      email: 'test@test.com',
      password: 'testUser123!',
    });
    await usersRepository.save(user);

    const result = await usersRepository.findByEmail('fail@test.com');

    expect(result).toBe(null);
  });
});

import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockUser } from '../../mockData/users';
import { getUsersRepository, UsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { login } from './login';

describe('login', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
    UsersRepository.findByEmail = jest
      .fn()
      .mockImplementation((email: string) =>
        getUsersRepository(testDataSource).findByEmail(email)
      );
    dbBackup = testDb.backup();
  });

  beforeEach(() => {
    dbBackup.restore();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('should fail if the provided email does not exist', async () => {
    const fakeUser = generateMockUser();
    const req = getMockReq({
      body: {
        email: 'testUser@test.com',
        password: 'testUser123!',
      },
    });
    const { res } = getMockRes();
    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
    await login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'A user with this email could not be found.',
    });
  });

  it('should fail if the provided password is incorrect', async () => {
    const fakeUser = generateMockUser();
    const req = getMockReq({
      body: {
        email: fakeUser.email,
        password: 'failUser456?',
      },
    });
    const { res } = getMockRes();
    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
    await login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'Incorrect password.',
    });
  });

  it('should log the user in if the provided credentials are correct', async () => {
    const fakeUser = generateMockUser();
    const req = getMockReq({
      body: {
        email: fakeUser.email,
        password: fakeUser.password,
      },
    });
    const { res } = getMockRes();
    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
    await login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      `username-email-userId-_${fakeUser.username}-${fakeUser.email}-1-_expiresIn`,
      { httpOnly: true, secure: false }
    );
    expect(res.json).toHaveBeenCalledWith({
      userId: '1',
    });
  });
});

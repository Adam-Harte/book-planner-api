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
import { signup, SignupReqBody } from './signup';

describe('signup', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    UsersRepository.findByEmail = jest
      .fn()
      .mockImplementation((email: string) =>
        getUsersRepository(testDataSource).findByEmail(email)
      );
    UsersRepository.create = jest
      .fn()
      .mockImplementation((user: any) =>
        getUsersRepository(testDataSource).create(user)
      );
    UsersRepository.save = jest
      .fn()
      .mockImplementation((user: any) =>
        getUsersRepository(testDataSource).save(user)
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

  it('should fail when trying to signup with an email that already exists', async () => {
    const fakeUser = generateMockUser();
    const req = getMockReq({
      body: {
        ...fakeUser,
      },
    });
    const { res } = getMockRes();
    const user = await UsersRepository.create(req.body);
    await UsersRepository.save(user);
    await signup(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        SignupReqBody,
        Record<string, any> | undefined,
        Record<string, any>
      >,
      res as Response
    );

    expect(res.status).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      message: 'A user with this email already exists.',
    });
  });

  it('should create a new user when validations pass and the email provided doesnt already exist', async () => {
    const fakeUser = generateMockUser();
    const req = getMockReq({
      body: {
        ...fakeUser,
      },
    });
    const { res } = getMockRes();
    await signup(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        SignupReqBody,
        Record<string, any> | undefined,
        Record<string, any>
      >,
      res as Response
    );

    expect(UsersRepository.create).toHaveBeenCalledWith({
      ...fakeUser,
      password: `${fakeUser.password}-12`,
    });
    expect(UsersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        ...fakeUser,
        password: `${fakeUser.password}-12`,
        id: 1,
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      `username-email-userId-_${fakeUser.username}-${fakeUser.email}-1-_expiresIn`,
      { httpOnly: true, secure: false }
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created.',
      userId: 1,
    });
  });
});

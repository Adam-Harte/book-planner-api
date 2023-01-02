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
import { deleteAccount } from './deleteAccount';

describe('deleteAccount', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
    UsersRepository.findOne = jest
      .fn()
      .mockImplementation((options: any) =>
        getUsersRepository(testDataSource).findOne(options)
      );
    UsersRepository.delete = jest
      .fn()
      .mockImplementation((id: number) =>
        getUsersRepository(testDataSource).delete(id)
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

  it('should fail if the req userId does not match the passed body id', async () => {
    const fakeUser = generateMockUser();
    const req = getMockReq({
      body: {
        id: 1,
      },
      userId: '2',
    });
    const { res } = getMockRes();
    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
    await deleteAccount(req as Request, res as Response);
    expect(res.clearCookie).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the req userId and passed body id dont exist', async () => {
    const fakeUser = generateMockUser();
    const req = getMockReq({
      body: {
        id: 2,
      },
      userId: '2',
    });
    const { res } = getMockRes();
    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);

    await deleteAccount(req as Request, res as Response);

    expect(res.clearCookie).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User not found.',
    });
  });

  it('should delete the user account if requested from the correct user', async () => {
    const fakeUser = generateMockUser();
    const req = getMockReq({
      body: {
        id: 1,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
    await deleteAccount(req as Request, res as Response);
    expect(res.clearCookie).toHaveBeenCalledWith('access_token');
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Successfully deleted user.',
    });
  });
});

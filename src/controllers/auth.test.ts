import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockUser } from '../mockData/users';
import { getUsersRepository, UsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';
import { deleteAccount, login, logout, signup } from './auth';

describe('Auth controller', () => {
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

  describe('signup', () => {
    // add a test for validation case

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
      await signup(req as Request, res as Response);

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
      await signup(req as Request, res as Response);

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

  describe('login', () => {
    it('should fail if the provided email does not exist', async () => {
      const fakeUser = generateMockUser();
      const req = getMockReq({
        body: {
          email: 'testUser@test.com',
          password: 'testUser123!',
        },
      });
      const { res } = getMockRes();
      const user = await UsersRepository.create(fakeUser);
      await UsersRepository.save(user);
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
      const user = await UsersRepository.create(fakeUser);
      await UsersRepository.save(user);
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
      const user = await UsersRepository.create(fakeUser);
      await UsersRepository.save(user);
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

  describe('logout', () => {
    it('should logout the user by clearing the access_token cookie', async () => {
      const req = getMockReq();
      const { res } = getMockRes();

      await logout(req as Request, res as Response);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Successfully logged out.',
      });
    });
  });

  describe('deleteAccount', () => {
    it('should fail if the req userId does not match the passed body id', async () => {
      const fakeUser = generateMockUser();
      const req = getMockReq({
        body: {
          id: 1,
        },
        userId: '2',
      });
      const { res } = getMockRes();
      const user = await UsersRepository.create(fakeUser);
      await UsersRepository.save(user);
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
      const user = await UsersRepository.create(fakeUser);
      await UsersRepository.save(user);

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
      const user = await UsersRepository.create(fakeUser);
      await UsersRepository.save(user);
      await deleteAccount(req as Request, res as Response);
      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Successfully deleted user.',
      });
    });
  });
});

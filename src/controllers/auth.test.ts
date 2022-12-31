import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

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

  const mockRequest = (
    body?: Record<string, any>,
    userId?: string
  ): Partial<Request> => ({
    body,
    userId,
  });

  const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

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
    bcrypt.hash = jest
      .fn()
      .mockImplementation((s: string, salt: string | number) =>
        Promise.resolve(`${s}-${salt}`)
      );
    bcrypt.compare = jest
      .fn()
      .mockImplementation(async (s: string, hash: string) => {
        const hashed1 = await bcrypt.hash(s, 12);
        const hashed2 = await bcrypt.hash(hash, 12);

        return Promise.resolve(hashed1 === hashed2);
      });
    jwt.sign = jest
      .fn()
      .mockImplementation(
        (payload: object, secret: string, options: object) => {
          const payloadKeysStr = Object.keys(payload).reduce(
            (acc, cur) => `${acc}${cur}-`,
            ''
          );
          const payloadValuesStr = Object.values(payload).reduce(
            (acc, cur) => `${acc}${cur}-`,
            ''
          );
          const objStr = Object.keys(options).reduce(
            (acc, cur) => `${acc}${cur}`,
            ''
          );
          return `${payloadKeysStr}_${payloadValuesStr}_${objStr}`;
        }
      );
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
      const req = mockRequest({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      const res = mockResponse();
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
      const req = mockRequest({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      const res = mockResponse();
      await signup(req as Request, res as Response);

      expect(UsersRepository.create).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'testUser123!-12',
        username: 'test',
      });
      expect(UsersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@test.com',
          id: 1,
          password: 'testUser123!-12',
          username: 'test',
        })
      );
      expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'username-email-userId-_test-test@test.com-1-_expiresIn',
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
      const req = mockRequest({
        email: 'testUser@test.com',
        password: 'testUser123!',
      });
      const res = mockResponse();
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);
      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'A user with this email could not be found.',
      });
    });

    it('should fail if the provided poassword is incorrect', async () => {
      const req = mockRequest({
        email: 'test@test.com',
        password: 'failUser456?',
      });
      const res = mockResponse();
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);
      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        message: 'Incorrect password.',
      });
    });

    it('should log the user in if the provided credentials are correct', async () => {
      const req = mockRequest({
        email: 'test@test.com',
        password: 'testUser123!',
      });
      const res = mockResponse();
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);
      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'username-email-userId-_test-test@test.com-1-_expiresIn',
        { httpOnly: true, secure: false }
      );
      expect(res.json).toHaveBeenCalledWith({
        userId: '1',
      });
    });
  });

  describe('logout', () => {
    it('should logout the user by clearing the access_token cookie', async () => {
      const req = mockRequest();
      const res = mockResponse();

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
      const req = mockRequest({ id: 1 }, '2');
      const res = mockResponse();
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);
      await deleteAccount(req as Request, res as Response);
      expect(res.clearCookie).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Forbidden account action.',
      });
    });

    it('should fail if the req userId and passed body id dont exist', async () => {
      const req = mockRequest({ id: 2 }, '2');
      const res = mockResponse();
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);

      await deleteAccount(req as Request, res as Response);

      expect(res.clearCookie).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpCode.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found.',
      });
    });

    it('should delete the user account if requested from the correct user', async () => {
      const req = mockRequest({ id: 1 }, '1');
      const res = mockResponse();
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
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

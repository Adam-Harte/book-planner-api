import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { getUsersRepository, UsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Auth routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen(8000);
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
        (payload: object, _secret: jwt.Secret, options: jwt.SignOptions) => {
          const payloadKeysStr = Object.keys(payload).reduce(
            (acc, cur) => `${acc}${cur}-`,
            ''
          );
          const payloadValuesStr = Object.values(payload).reduce(
            (acc, cur) => `${acc}${cur}-`,
            ''
          );
          const objStr = Object.keys(options).reduce(
            (acc, cur) => `${acc}${cur}-`,
            ''
          );
          return `${payloadKeysStr}_${payloadValuesStr}_${objStr}`;
        }
      );
    jwt.verify = jest.fn().mockImplementation((token: string) => {
      const tokenObjs = token.split('_');
      const tokenKeys = tokenObjs[0].split('-');
      const tokenValues = tokenObjs[1].split('-');

      return tokenKeys.reduce(
        (acc, cur, idx) => ({
          ...acc,
          ...(tokenValues[idx] !== '-' && {
            [cur]: tokenValues[idx],
          }),
        }),
        {}
      );
    });
  });

  beforeEach(() => {
    dbBackup.restore();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
    server.close();
  });

  describe('/signup', () => {
    it('fails validation when an incorrect email sent', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        username: 'test',
        email: 'testfail.com',
        password: 'testUser123!',
      });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'Invalid value',
            param: 'email',
            value: 'testfail.com',
          },
        ],
      });
    });

    it('fails validation when a weak password is sent', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        username: 'test',
        email: 'test@test.com',
        password: 'testfail123',
      });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'Invalid value',
            param: 'password',
            value: 'testfail123',
          },
        ],
      });
    });

    it('creates a new user when /signup route is passed correct data', async () => {
      const response = await request(app).post('/api/auth/signup').send({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });

      expect(response.header['set-cookie']).toEqual([
        'access_token=username-email-userId-_test-test%40test.com-1-_expiresIn-; Path=/; HttpOnly',
      ]);
      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({ message: 'User created.', userId: 1 });
    });
  });

  describe('/login', () => {
    it('fails validation when an incorrect email sent', async () => {
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);

      const response = await request(app).post('/api/auth/login').send({
        email: 'testfail.com',
        password: 'testUser123!',
      });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'Invalid value',
            param: 'email',
            value: 'testfail.com',
          },
        ],
      });
    });

    it('fails validation when a weak password sent', async () => {
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: 'testfail123',
      });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'Invalid value',
            param: 'password',
            value: 'testfail123',
          },
        ],
      });
    });

    it('fails when a non existent email is sent', async () => {
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@fail.com',
        password: 'testUser123!',
      });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: 'A user with this email could not be found.',
      });
    });

    it('fails when an incorrect password is sent', async () => {
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: 'testFail123!',
      });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
      expect(response.body).toEqual({
        message: 'Incorrect password.',
      });
    });

    it('logs in the user when the correct email and password is sent', async () => {
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: 'testUser123!',
      });

      expect(response.header['set-cookie']).toEqual([
        'access_token=username-email-userId-_test-test%40test.com-1-_expiresIn-; Path=/; HttpOnly',
      ]);
      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({ userId: '1' });
    });
  });

  describe('/logout', () => {
    it('fails when a user is not logged in with an access_token cookie', async () => {
      const response = await request(app).get('/api/auth/logout');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });

    it('logs out the user by clearing the access_token cookie when they are logged in', async () => {
      const response = await request(app)
        .get('/api/auth/logout')
        .set('Cookie', [
          'access_token=username-email-userId-_test-test%40test.com-1-_expiresIn-; Path=/; HttpOnly',
        ]);

      expect(response.header['set-cookie']).toEqual([
        'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ]);
      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({ message: 'Successfully logged out.' });
    });
  });

  describe('/delete-account', () => {
    it('fails if the targeting user to delete does not match the logged in user', async () => {
      const response = await request(app)
        .delete('/api/auth/delete-account')
        .set('Cookie', [
          'access_token=username-email-userId-_testFail-testfail%40test.com-2-_expiresIn-; Path=/; HttpOnly',
        ])
        .send({
          id: 1,
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({ message: 'Forbidden account action.' });
    });

    it('fails if the user account cannot be found', async () => {
      const response = await request(app)
        .delete('/api/auth/delete-account')
        .set('Cookie', [
          'access_token=username-email-userId-_testFail-testfail%40test.com-2-_expiresIn-; Path=/; HttpOnly',
        ])
        .send({
          id: 2,
        });

      expect(response.statusCode).toBe(HttpCode.NOT_FOUND);
      expect(response.body).toEqual({ message: 'User not found.' });
    });

    it('deletes the user account when they are logged in and perfomr the action on their own account', async () => {
      const user = await UsersRepository.create({
        username: 'test',
        email: 'test@test.com',
        password: 'testUser123!',
      });
      await UsersRepository.save(user);
      const response = await request(app)
        .delete('/api/auth/delete-account')
        .set('Cookie', [
          'access_token=username-email-userId-_test-test%40test.com-1-_expiresIn-; Path=/; HttpOnly',
        ])
        .send({
          id: 1,
        });

      expect(response.header['set-cookie']).toEqual([
        'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ]);
      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({ message: 'Successfully deleted user.' });
    });
  });
});

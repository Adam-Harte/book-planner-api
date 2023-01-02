import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository, UsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Series routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let user: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    UsersRepository.findOne = jest
      .fn()
      .mockImplementation((options: object) =>
        usersRepository.findOne(options)
      );
    SeriesRepository.create = jest
      .fn()
      .mockImplementation((series: any) =>
        getSeriesRepository(testDataSource).create(series)
      );
    SeriesRepository.save = jest
      .fn()
      .mockImplementation((series: any) =>
        getSeriesRepository(testDataSource).save(series)
      );
    SeriesRepository.delete = jest
      .fn()
      .mockImplementation((id: number) =>
        getSeriesRepository(testDataSource).delete(id)
      );
    SeriesRepository.getAllByUserId = jest
      .fn()
      .mockImplementation((userId: number) =>
        getSeriesRepository(testDataSource).getAllByUserId(userId)
      );
    SeriesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        getSeriesRepository(testDataSource).getByUserIdAndSeriesId(
          userId,
          seriesId
        )
      );
    dbBackup = testDb.backup();
  });

  beforeEach(async () => {
    dbBackup.restore();
    user = await usersRepository.create({
      username: 'test',
      email: 'test@test.com',
      password: 'testUser123!',
    });
    await usersRepository.save(user);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
    server.close();
  });

  describe('GET /series', () => {
    it('gets all the series belonging to the user', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app)
        .get('/api/series')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Series by user id fetched.',
        data: [
          {
            id: series1.id,
            name: series1.name,
            genre: series1.genre,
          },
          {
            id: series2.id,
            name: series2.name,
            genre: series2.genre,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app).get('/api/series');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /series', () => {
    it('fails validation when no name sent', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);

      const response = await request(app)
        .post('/api/series')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          genre: fakeSeries2.genre,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'name field is required.',
            param: 'name',
          },
        ],
      });
    });

    it('creates a new series when /series route is passed correct data', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);

      const response = await request(app)
        .post('/api/series')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          name: fakeSeries2.name,
          genre: fakeSeries2.genre,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Series created.',
        data: {
          id: 2,
          name: fakeSeries2.name,
          genre: fakeSeries2.genre,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);

      const response = await request(app)
        .post('/api/series')
        .send({ name: fakeSeries2.name, genre: fakeSeries2.genre });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /series:seriesId', () => {
    it('gets a series belonging to the user', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app)
        .get('/api/series/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Series by id fetched.',
        data: expect.objectContaining({
          id: series1.id,
          name: series1.name,
          genre: series1.genre,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app).get('/api/series/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /series:seriesId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app)
        .patch('/api/series/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'updatedData field is required with data.',
            param: 'updatedData',
          },
        ],
      });
    });

    it('updates a series belonging to the user', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const updatedFakeSeries = generateMockSeries();
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app)
        .patch('/api/series/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeSeries,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Series updated.',
        data: expect.objectContaining({
          id: series1.id,
          name: updatedFakeSeries.name,
          genre: updatedFakeSeries.genre,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app).patch('/api/series/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /series:seriesId', () => {
    it('deletes a series belonging to the user', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app)
        .delete('/api/series/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Series deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSeries1 = generateMockSeries(user);
      const fakeSeries2 = generateMockSeries(user);
      const series1 = await seriesRepository.create(fakeSeries1);
      await seriesRepository.save(series1);
      const series2 = await seriesRepository.create(fakeSeries2);
      await seriesRepository.save(series2);

      const response = await request(app).delete('/api/series/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

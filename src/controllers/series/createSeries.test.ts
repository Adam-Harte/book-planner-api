import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
import { getUsersRepository, UsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { createSeries } from './createSeries';

describe('createSeries', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let fakeUser: any;
  let user: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
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
    dbBackup = testDb.backup();
  });

  beforeEach(async () => {
    dbBackup.restore();
    fakeUser = generateMockUser();
    user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('should create a new series belonging to the user', async () => {
    const fakeSeries = generateMockSeries(user);
    const req = getMockReq({
      body: {
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createSeries(req as Request, res as Response);

    expect(SeriesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      genre: req.body.genre,
      user,
    });
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Series created.',
      data: {
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      },
    });
  });
});

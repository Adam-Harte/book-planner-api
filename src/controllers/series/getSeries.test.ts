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
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { getSeries } from './getSeries';

describe('getSeries', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let fakeUser: any;
  let user: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    SeriesRepository.getAllByUserId = jest
      .fn()
      .mockImplementation((userId: number) =>
        getSeriesRepository(testDataSource).getAllByUserId(userId)
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

  it('should get all series belonging to the user', async () => {
    const fakeSeries1 = generateMockSeries(user);
    const fakeSeries2 = generateMockSeries(user);

    const series1 = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series1);

    const series2 = await seriesRepository.create(fakeSeries2);
    await seriesRepository.save(series2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getSeries(req as Request, res as Response);

    expect(SeriesRepository.getAllByUserId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
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
});

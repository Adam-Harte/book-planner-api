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
import { getSeriesById, GetSeriesByIdReqParams } from './getSeriesById';

describe('getSeriesById', () => {
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
    SeriesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        seriesRepository.getByUserIdAndSeriesId(userId, seriesId)
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

  it('should fail if the series does not belong to the user', async () => {
    const fakeSeries1 = generateMockSeries(user);
    const fakeSeries2 = generateMockSeries(user);

    const series1 = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series1);

    const series2 = await seriesRepository.create(fakeSeries2);
    await seriesRepository.save(series2);

    const req = getMockReq({
      params: {
        seriesId: '1',
      },
      userId: '2',
    });
    const { res } = getMockRes();

    await getSeriesById(
      req as unknown as Request<
        GetSeriesByIdReqParams,
        unknown,
        unknown,
        unknown,
        Record<string, any>
      >,
      res as Response
    );

    expect(SeriesRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(2, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should get one series by a specific id', async () => {
    const fakeSeries1 = generateMockSeries(user);
    const fakeSeries2 = generateMockSeries(user);

    const series1 = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series1);

    const series2 = await seriesRepository.create(fakeSeries2);
    await seriesRepository.save(series2);

    const req = getMockReq({
      params: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getSeriesById(
      req as unknown as Request<
        GetSeriesByIdReqParams,
        unknown,
        unknown,
        unknown,
        Record<string, any>
      >,
      res as Response
    );

    expect(SeriesRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Series by id fetched.',
      data: {
        id: 1,
        name: fakeSeries1.name,
        genre: fakeSeries1.genre,
      },
    });
  });
});

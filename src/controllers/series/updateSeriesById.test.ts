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
import { updateSeriesById } from './updateSeriesById';

describe('updateSeriesById', () => {
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
    SeriesRepository.save = jest
      .fn()
      .mockImplementation((series: any) => seriesRepository.save(series));
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

  it('should fail if the updated series does not belong to the user', async () => {
    const fakeSeries1 = generateMockSeries(user);
    const fakeSeries2 = generateMockSeries(user);
    const updatedFakeSeries = generateMockSeries();

    const series1 = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series1);

    const series2 = await seriesRepository.create(fakeSeries2);
    await seriesRepository.save(series2);

    const req = getMockReq({
      params: {
        seriesId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeSeries,
        },
      },
      userId: '2',
    });
    const { res } = getMockRes();

    await updateSeriesById(req as Request, res as Response);

    expect(SeriesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a series by a specific id', async () => {
    const fakeSeries1 = generateMockSeries(user);
    const fakeSeries2 = generateMockSeries(user);
    const updatedFakeSeries = generateMockSeries();

    const series1 = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series1);

    const series2 = await seriesRepository.create(fakeSeries2);
    await seriesRepository.save(series2);

    const req = getMockReq({
      params: {
        seriesId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeSeries,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateSeriesById(req as Request, res as Response);

    expect(SeriesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeSeries)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Series updated.',
      data: {
        id: 1,
        name: updatedFakeSeries.name,
        genre: updatedFakeSeries.genre,
      },
    });
  });
});

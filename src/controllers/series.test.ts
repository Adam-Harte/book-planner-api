import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

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
import {
  createSeries,
  deleteSeriesById,
  getSeries,
  getSeriesById,
  updateSeriesById,
} from './series';

describe('Series controller', () => {
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
    fakeUser = generateMockUser();
    user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  describe('getSeries', () => {
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

  describe('createSeries', () => {
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

  describe('getSeriesById', () => {
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

      await getSeriesById(req as Request, res as Response);

      expect(SeriesRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
        2,
        1
      );
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

      await getSeriesById(req as Request, res as Response);

      expect(SeriesRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
        1,
        1
      );
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

  describe('updateSeriesById', () => {
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

  describe('deleteSeriesById', () => {
    it('should fail if the series being deleted does not belong to the user', async () => {
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

      await deleteSeriesById(req as Request, res as Response);

      expect(SeriesRepository.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Forbidden account action.',
      });
    });

    it('should delete the series by a specific id', async () => {
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

      await deleteSeriesById(req as Request, res as Response);

      expect(SeriesRepository.delete).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Series deleted.',
      });
    });
  });
});

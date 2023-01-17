import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockTechnology } from '../../mockData/technologies';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import { getSeriesRepository } from '../../repositories/series';
import {
  getTechnologiesRepository,
  TechnologiesRepository,
} from '../../repositories/technologies';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  updateTechnologyById,
  UpdateTechnologyReqBody,
  UpdateTechnologyReqParams,
  UpdateTechnologyReqQuery,
} from './updateTechnologyById';

describe('updateTechnologyById', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let technologiesRepository: any;
  let fakeUser: any;
  let user: any;
  let fakeSeries: any;
  let series: any;
  let fakeBook: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    technologiesRepository = getTechnologiesRepository(testDataSource);
    TechnologiesRepository.save = jest
      .fn()
      .mockImplementation((technology: any) =>
        technologiesRepository.save(technology)
      );
    TechnologiesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (technologyId: number, userId: number, seriesId: number) =>
          technologiesRepository.getByUserIdAndSeriesId(
            technologyId,
            userId,
            seriesId
          )
      );
    TechnologiesRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (technologyId: number, userId: number, bookId: number) =>
          technologiesRepository.getByUserIdAndBookId(
            technologyId,
            userId,
            bookId
          )
      );
    dbBackup = testDb.backup();
  });

  beforeEach(async () => {
    dbBackup.restore();
    fakeUser = generateMockUser();
    user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
    fakeSeries = generateMockSeries(user);
    series = await seriesRepository.create(fakeSeries);
    await seriesRepository.save(series);
    fakeBook = generateMockBook(user);
    book = await booksRepository.create(fakeBook);
    await booksRepository.save(book);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeTechnology = generateMockTechnology(series, [book]);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateTechnologyById(
      req as unknown as Request<
        UpdateTechnologyReqParams,
        unknown,
        UpdateTechnologyReqBody,
        UpdateTechnologyReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a technology is not fetched by a series or book id', async () => {
    const fakeTechnology = generateMockTechnology(series, [book]);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateTechnologyById(
      req as unknown as Request<
        UpdateTechnologyReqParams,
        unknown,
        UpdateTechnologyReqBody,
        UpdateTechnologyReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a technology by a specific id and series id', async () => {
    const fakeTechnology = generateMockTechnology(series);
    const updatedFakeTechnology = generateMockTechnology();
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeTechnology,
        },
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateTechnologyById(
      req as unknown as Request<
        UpdateTechnologyReqParams,
        unknown,
        UpdateTechnologyReqBody,
        UpdateTechnologyReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeTechnology)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Technology updated.',
      data: {
        id: 1,
        name: updatedFakeTechnology.name,
        description: updatedFakeTechnology.description,
        inventor: updatedFakeTechnology.inventor,
      },
    });
  });

  it('should update a technology by a specific id and book id', async () => {
    const fakeTechnology = generateMockTechnology({}, [book]);
    const updatedFakeTechnology = generateMockTechnology();
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeTechnology,
        },
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateTechnologyById(
      req as unknown as Request<
        UpdateTechnologyReqParams,
        unknown,
        UpdateTechnologyReqBody,
        UpdateTechnologyReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeTechnology)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Technology updated.',
      data: {
        id: 1,
        name: updatedFakeTechnology.name,
        description: updatedFakeTechnology.description,
        inventor: updatedFakeTechnology.inventor,
      },
    });
  });
});

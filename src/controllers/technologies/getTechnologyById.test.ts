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
  getTechnologyById,
  GetTechnologyByIdReqParams,
  GetTechnologyByIdReqQuery,
} from './getTechnologyById';

describe('getTechnologyById', () => {
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

  it('should fail if the technology does not belong to the users series', async () => {
    const fakeTechnology = generateMockTechnology(series);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTechnologyById(
      req as unknown as Request<
        GetTechnologyByIdReqParams,
        unknown,
        unknown,
        GetTechnologyByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      2
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the technology does not belong to the users book', async () => {
    const fakeTechnology = generateMockTechnology({}, [book]);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTechnologyById(
      req as unknown as Request<
        GetTechnologyByIdReqParams,
        unknown,
        unknown,
        GetTechnologyByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1,
      2
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if neither seriesId or bookId query params are passed', async () => {
    const fakeTechnology = generateMockTechnology(series);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTechnologyById(
      req as unknown as Request<
        GetTechnologyByIdReqParams,
        unknown,
        unknown,
        GetTechnologyByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      TechnologiesRepository.getByUserIdAndSeriesId
    ).not.toHaveBeenCalled();
    expect(TechnologiesRepository.getByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should get one technology by a specific id and series id', async () => {
    const fakeTechnology = generateMockTechnology(series);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTechnologyById(
      req as unknown as Request<
        GetTechnologyByIdReqParams,
        unknown,
        unknown,
        GetTechnologyByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Technology by id and series id fetched.',
      data: {
        id: technology.id,
        name: technology.name,
        description: technology.description,
        inventor: technology.inventor,
      },
    });
  });

  it('should get one technology by a specific id and book id', async () => {
    const fakeTechnology = generateMockTechnology({}, [book]);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const req = getMockReq({
      params: {
        technologyId: '1',
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTechnologyById(
      req as unknown as Request<
        GetTechnologyByIdReqParams,
        unknown,
        unknown,
        GetTechnologyByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Technology by id and book id fetched.',
      data: {
        id: technology.id,
        name: technology.name,
        description: technology.description,
        inventor: technology.inventor,
      },
    });
  });
});

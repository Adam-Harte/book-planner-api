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
import { getTechnologies, GetTechnologiesReqQuery } from './getTechnologies';

describe('getTechnologies', () => {
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
    TechnologiesRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        technologiesRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    TechnologiesRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        technologiesRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all technologies belonging to the user and a series', async () => {
    const fakeTechnology1 = generateMockTechnology(series);
    const fakeTechnology2 = generateMockTechnology(series);

    const technology1 = await technologiesRepository.create(fakeTechnology1);
    await technologiesRepository.save(technology1);

    const technology2 = await technologiesRepository.create(fakeTechnology2);
    await technologiesRepository.save(technology2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getTechnologies(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetTechnologiesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      TechnologiesRepository.getAllByUserIdAndSeriesId
    ).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Technologies by user id and series id fetched.',
      data: [
        {
          id: technology1.id,
          name: technology1.name,
          description: technology1.description,
          inventor: technology1.inventor,
        },
        {
          id: technology2.id,
          name: technology2.name,
          description: technology2.description,
          inventor: technology2.inventor,
        },
      ],
    });
  });

  it('should get all technologies belonging to the user and a book', async () => {
    const fakeTechnology1 = generateMockTechnology({}, [book]);
    const fakeTechnology2 = generateMockTechnology({}, [book]);

    const technology1 = await technologiesRepository.create(fakeTechnology1);
    await technologiesRepository.save(technology1);

    const technology2 = await technologiesRepository.create(fakeTechnology2);
    await technologiesRepository.save(technology2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getTechnologies(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetTechnologiesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Technologies by user id and book id fetched.',
      data: [
        {
          id: technology1.id,
          name: technology1.name,
          description: technology1.description,
          inventor: technology1.inventor,
        },
        {
          id: technology2.id,
          name: technology2.name,
          description: technology2.description,
          inventor: technology2.inventor,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeTechnology1 = generateMockTechnology(series);
    const fakeTechnology2 = generateMockTechnology(series);

    const technology1 = await technologiesRepository.create(fakeTechnology1);
    await technologiesRepository.save(technology1);

    const technology2 = await technologiesRepository.create(fakeTechnology2);
    await technologiesRepository.save(technology2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getTechnologies(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetTechnologiesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      TechnologiesRepository.getAllByUserIdAndSeriesId
    ).not.toHaveBeenCalled();
    expect(
      TechnologiesRepository.getAllByUserIdAndBookId
    ).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

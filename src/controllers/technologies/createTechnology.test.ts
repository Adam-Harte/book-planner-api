import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockTechnology } from '../../mockData/technologies';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
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
  createTechnology,
  CreateTechnologyReqBody,
  CreateTechnologyReqQuery,
} from './createTechnology';

describe('createTechnology', () => {
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
    SeriesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        seriesRepository.getByUserIdAndSeriesId(userId, seriesId)
      );
    BooksRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        booksRepository.getByUserIdAndBookId(userId, bookId)
      );
    TechnologiesRepository.create = jest
      .fn()
      .mockImplementation((technology: any) =>
        technologiesRepository.create(technology)
      );
    TechnologiesRepository.save = jest
      .fn()
      .mockImplementation((technology: any) =>
        technologiesRepository.save(technology)
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

  it('fails if neither the seriesId or bookId query params are passed', async () => {
    const fakeTechnology = generateMockTechnology();
    const req = getMockReq({
      body: {
        name: fakeTechnology.name,
        description: fakeTechnology.description,
        inventor: fakeTechnology.inventor,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createTechnology(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateTechnologyReqBody,
        CreateTechnologyReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.create).not.toHaveBeenCalled();
    expect(TechnologiesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new technology belonging to a series', async () => {
    const fakeTechnology = generateMockTechnology();
    const req = getMockReq({
      body: {
        name: fakeTechnology.name,
        description: fakeTechnology.description,
        inventor: fakeTechnology.inventor,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createTechnology(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateTechnologyReqBody,
        CreateTechnologyReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      inventor: req.body.inventor,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(TechnologiesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        inventor: req.body.inventor,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Technology created.',
      data: {
        id: 1,
        name: fakeTechnology.name,
        description: fakeTechnology.description,
        inventor: fakeTechnology.inventor,
      },
    });
  });

  it('should create a new technology belonging to a book', async () => {
    const fakeTechnology = generateMockTechnology();
    const req = getMockReq({
      body: {
        name: fakeTechnology.name,
        description: fakeTechnology.description,
        inventor: fakeTechnology.inventor,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createTechnology(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateTechnologyReqBody,
        CreateTechnologyReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      inventor: req.body.inventor,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(TechnologiesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        inventor: req.body.inventor,
        books: [
          expect.objectContaining({
            id: 1,
            name: fakeBook.name,
            genre: fakeBook.genre,
          }),
        ],
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Technology created.',
      data: {
        id: 1,
        name: fakeTechnology.name,
        description: fakeTechnology.description,
        inventor: fakeTechnology.inventor,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the technology', async () => {
    const fakeTechnology = generateMockTechnology();
    const req = getMockReq({
      body: {
        name: fakeTechnology.name,
        description: fakeTechnology.description,
        inventor: fakeTechnology.inventor,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createTechnology(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateTechnologyReqBody,
        CreateTechnologyReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TechnologiesRepository.create).not.toHaveBeenCalled();
    expect(TechnologiesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A technology must be created belonging to one of your series or books.',
    });
  });
});

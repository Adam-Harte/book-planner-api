import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { generateMockWorld } from '../../mockData/worlds';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  getWorldsRepository,
  WorldsRepository,
} from '../../repositories/worlds';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  createWorld,
  CreateWorldReqBody,
  CreateWorldReqQuery,
} from './createWorld';

describe('createWorld', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let worldsRepository: any;
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
    worldsRepository = getWorldsRepository(testDataSource);
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
    WorldsRepository.create = jest
      .fn()
      .mockImplementation((world: any) => worldsRepository.create(world));
    WorldsRepository.save = jest
      .fn()
      .mockImplementation((world: any) => worldsRepository.save(world));
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
    const fakeWorld = generateMockWorld();
    const req = getMockReq({
      body: {
        name: fakeWorld.name,
        description: fakeWorld.description,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createWorld(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateWorldReqBody,
        CreateWorldReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.create).not.toHaveBeenCalled();
    expect(WorldsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new world belonging to a series', async () => {
    const fakeWorld = generateMockWorld(series);
    const req = getMockReq({
      body: {
        name: fakeWorld.name,
        description: fakeWorld.description,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createWorld(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateWorldReqBody,
        CreateWorldReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(WorldsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'World created.',
      data: {
        id: 1,
        name: fakeWorld.name,
        description: fakeWorld.description,
      },
    });
  });

  it('should create a new World belonging to a book', async () => {
    const fakeWorld = generateMockWorld({}, [book]);
    const req = getMockReq({
      body: {
        name: fakeWorld.name,
        description: fakeWorld.description,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createWorld(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateWorldReqBody,
        CreateWorldReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(WorldsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
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
      message: 'World created.',
      data: {
        id: 1,
        name: fakeWorld.name,
        description: fakeWorld.description,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the world', async () => {
    const fakeWorld = generateMockWorld(series, [book]);
    const req = getMockReq({
      body: {
        name: fakeWorld.name,
        description: fakeWorld.description,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createWorld(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateWorldReqBody,
        CreateWorldReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.create).not.toHaveBeenCalled();
    expect(WorldsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A world must be created belonging to one of your series or books.',
    });
  });
});

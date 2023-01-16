import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockMagicSystem } from '../../mockData/magicSystems';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getMagicSystemsRepository,
  MagicSystemsRepository,
} from '../../repositories/magicSystems';
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
import {
  createMagicSystem,
  CreateMagicSystemReqBody,
  CreateMagicSystemReqQuery,
} from './createMagicSystem';

describe('createMagicSystem', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let magicSystemsRepository: any;
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
    magicSystemsRepository = getMagicSystemsRepository(testDataSource);
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
    MagicSystemsRepository.create = jest
      .fn()
      .mockImplementation((magicSystem: any) =>
        magicSystemsRepository.create(magicSystem)
      );
    MagicSystemsRepository.save = jest
      .fn()
      .mockImplementation((magicSystem: any) =>
        magicSystemsRepository.save(magicSystem)
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
    const fakeMagicSystem = generateMockMagicSystem();
    const req = getMockReq({
      body: {
        name: fakeMagicSystem.name,
        description: fakeMagicSystem.description,
        rules: fakeMagicSystem.rules,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createMagicSystem(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateMagicSystemReqBody,
        CreateMagicSystemReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.create).not.toHaveBeenCalled();
    expect(MagicSystemsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new magic system belonging to a series', async () => {
    const fakeMagicSystem = generateMockMagicSystem();
    const req = getMockReq({
      body: {
        name: fakeMagicSystem.name,
        description: fakeMagicSystem.description,
        rules: fakeMagicSystem.rules,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createMagicSystem(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateMagicSystemReqBody,
        CreateMagicSystemReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      rules: req.body.rules,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(MagicSystemsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        rules: req.body.rules,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Magic System created.',
      data: {
        id: 1,
        name: fakeMagicSystem.name,
        description: fakeMagicSystem.description,
        rules: fakeMagicSystem.rules,
      },
    });
  });

  it('should create a new magic system belonging to a book', async () => {
    const fakeMagicSystem = generateMockMagicSystem();
    const req = getMockReq({
      body: {
        name: fakeMagicSystem.name,
        description: fakeMagicSystem.description,
        rules: fakeMagicSystem.rules,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createMagicSystem(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateMagicSystemReqBody,
        CreateMagicSystemReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      rules: req.body.rules,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(MagicSystemsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        rules: req.body.rules,
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
      message: 'Magic System created.',
      data: {
        id: 1,
        name: fakeMagicSystem.name,
        description: fakeMagicSystem.description,
        rules: fakeMagicSystem.rules,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the magic system', async () => {
    const fakeMagicSystem = generateMockMagicSystem();
    const req = getMockReq({
      body: {
        name: fakeMagicSystem.name,
        description: fakeMagicSystem.description,
        rules: fakeMagicSystem.rules,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createMagicSystem(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateMagicSystemReqBody,
        CreateMagicSystemReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.create).not.toHaveBeenCalled();
    expect(MagicSystemsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A magic system must be created belonging to one of your series or books.',
    });
  });
});

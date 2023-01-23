import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockTransport } from '../../mockData/transports';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
import {
  getTransportsRepository,
  TransportsRepository,
} from '../../repositories/transports';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  createTransport,
  CreateTransportReqBody,
  CreateTransportReqQuery,
} from './createTransport';

describe('createTransport', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let transportssRepository: any;
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
    transportssRepository = getTransportsRepository(testDataSource);
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
    TransportsRepository.create = jest
      .fn()
      .mockImplementation((transport: any) =>
        transportssRepository.create(transport)
      );
    TransportsRepository.save = jest
      .fn()
      .mockImplementation((transport: any) =>
        transportssRepository.save(transport)
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
    const fakeTransport = generateMockTransport();
    const req = getMockReq({
      body: {
        name: fakeTransport.name,
        description: fakeTransport.description,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createTransport(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateTransportReqBody,
        CreateTransportReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.create).not.toHaveBeenCalled();
    expect(TransportsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new transport belonging to a series', async () => {
    const fakeTransport = generateMockTransport();
    const req = getMockReq({
      body: {
        name: fakeTransport.name,
        description: fakeTransport.description,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createTransport(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateTransportReqBody,
        CreateTransportReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(TransportsRepository.save).toHaveBeenCalledWith(
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
      message: 'Transport created.',
      data: {
        id: 1,
        name: fakeTransport.name,
        description: fakeTransport.description,
      },
    });
  });

  it('should create a new transport belonging to a book', async () => {
    const fakeTransport = generateMockTransport();
    const req = getMockReq({
      body: {
        name: fakeTransport.name,
        description: fakeTransport.description,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createTransport(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateTransportReqBody,
        CreateTransportReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.create).toHaveBeenCalledWith({
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
    expect(TransportsRepository.save).toHaveBeenCalledWith(
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
      message: 'Transport created.',
      data: {
        id: 1,
        name: fakeTransport.name,
        description: fakeTransport.description,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the transport', async () => {
    const fakeTransport = generateMockTransport();
    const req = getMockReq({
      body: {
        name: fakeTransport.name,
        description: fakeTransport.description,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createTransport(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateTransportReqBody,
        CreateTransportReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.create).not.toHaveBeenCalled();
    expect(TransportsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A transport must be created belonging to one of your series or books.',
    });
  });
});

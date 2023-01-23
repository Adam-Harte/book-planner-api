import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockTransport } from '../../mockData/transports';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import { getSeriesRepository } from '../../repositories/series';
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
  getTransportById,
  GetTransportByIdReqParams,
  GetTransportByIdReqQuery,
} from './getTransportById';

describe('getTransportById', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let transportsRepository: any;
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
    transportsRepository = getTransportsRepository(testDataSource);
    TransportsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (transportId: number, userId: number, seriesId: number) =>
          transportsRepository.getByUserIdAndSeriesId(
            transportId,
            userId,
            seriesId
          )
      );
    TransportsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (transportId: number, userId: number, bookId: number) =>
          transportsRepository.getByUserIdAndBookId(transportId, userId, bookId)
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

  it('should fail if the transport does not belong to the users series', async () => {
    const fakeTransport = generateMockTransport(series);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTransportById(
      req as unknown as Request<
        GetTransportByIdReqParams,
        unknown,
        unknown,
        GetTransportByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      2
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the transport does not belong to the users book', async () => {
    const fakeTransport = generateMockTransport({}, [book]);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTransportById(
      req as unknown as Request<
        GetTransportByIdReqParams,
        unknown,
        unknown,
        GetTransportByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
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
    const fakeTransport = generateMockTransport(series);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTransportById(
      req as unknown as Request<
        GetTransportByIdReqParams,
        unknown,
        unknown,
        GetTransportByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.getByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(TransportsRepository.getByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should get one transport by a specific id and series id', async () => {
    const fakeTransport = generateMockTransport(series);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTransportById(
      req as unknown as Request<
        GetTransportByIdReqParams,
        unknown,
        unknown,
        GetTransportByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transport by id and series id fetched.',
      data: {
        id: transport.id,
        name: transport.name,
        description: transport.description,
      },
    });
  });

  it('should get one transport by a specific id and book id', async () => {
    const fakeTransport = generateMockTransport({}, [book]);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getTransportById(
      req as unknown as Request<
        GetTransportByIdReqParams,
        unknown,
        unknown,
        GetTransportByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transport by id and book id fetched.',
      data: {
        id: transport.id,
        name: transport.name,
        description: transport.description,
      },
    });
  });
});

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
  updateTransportById,
  UpdateTransportReqBody,
  UpdateTransportReqParams,
  UpdateTransportReqQuery,
} from './updateTransportById';

describe('updateTransportById', () => {
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
    TransportsRepository.save = jest
      .fn()
      .mockImplementation((transport: any) =>
        transportsRepository.save(transport)
      );
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeTransport = generateMockTransport(series, [book]);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateTransportById(
      req as unknown as Request<
        UpdateTransportReqParams,
        unknown,
        UpdateTransportReqBody,
        UpdateTransportReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a transport is not fetched by a series or book id', async () => {
    const fakeTransport = generateMockTransport(series, [book]);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateTransportById(
      req as unknown as Request<
        UpdateTransportReqParams,
        unknown,
        UpdateTransportReqBody,
        UpdateTransportReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a transport by a specific id and series id', async () => {
    const fakeTransport = generateMockTransport(series);
    const updatedFakeTransport = generateMockTransport();
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      query: {
        seriesId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeTransport,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateTransportById(
      req as unknown as Request<
        UpdateTransportReqParams,
        unknown,
        UpdateTransportReqBody,
        UpdateTransportReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeTransport)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transport updated.',
      data: {
        id: 1,
        name: updatedFakeTransport.name,
        description: updatedFakeTransport.description,
      },
    });
  });

  it('should update a transport by a specific id and book id', async () => {
    const fakeTransport = generateMockTransport({}, [book]);
    const updatedFakeTransport = generateMockTransport();
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const req = getMockReq({
      params: {
        transportId: '1',
      },
      query: {
        bookId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeTransport,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateTransportById(
      req as unknown as Request<
        UpdateTransportReqParams,
        unknown,
        UpdateTransportReqBody,
        UpdateTransportReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeTransport)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transport updated.',
      data: {
        id: 1,
        name: updatedFakeTransport.name,
        description: updatedFakeTransport.description,
      },
    });
  });
});

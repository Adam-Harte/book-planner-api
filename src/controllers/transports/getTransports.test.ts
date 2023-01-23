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
import { getTransports, GetTransportsReqQuery } from './getTransports';

describe('getTransports', () => {
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
    TransportsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        transportsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    TransportsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        transportsRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all transports belonging to the user and a series', async () => {
    const fakeTransport1 = generateMockTransport(series);
    const fakeTransport2 = generateMockTransport(series);

    const transport1 = await transportsRepository.create(fakeTransport1);
    await transportsRepository.save(transport1);

    const transport2 = await transportsRepository.create(fakeTransport2);
    await transportsRepository.save(transport2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getTransports(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetTransportsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transports by user id and series id fetched.',
      data: [
        {
          id: transport1.id,
          name: transport1.name,
          description: transport1.description,
        },
        {
          id: transport2.id,
          name: transport2.name,
          description: transport2.description,
        },
      ],
    });
  });

  it('should get all transports belonging to the user and a book', async () => {
    const fakeTransport1 = generateMockTransport({}, [book]);
    const fakeTransport2 = generateMockTransport({}, [book]);

    const transport1 = await transportsRepository.create(fakeTransport1);
    await transportsRepository.save(transport1);

    const transport2 = await transportsRepository.create(fakeTransport2);
    await transportsRepository.save(transport2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getTransports(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetTransportsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(TransportsRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Transports by user id and book id fetched.',
      data: [
        {
          id: transport1.id,
          name: transport1.name,
          description: transport1.description,
        },
        {
          id: transport2.id,
          name: transport2.name,
          description: transport2.description,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeTransport1 = generateMockTransport(series);
    const fakeTransport2 = generateMockTransport(series);

    const transport1 = await transportsRepository.create(fakeTransport1);
    await transportsRepository.save(transport1);

    const transport2 = await transportsRepository.create(fakeTransport2);
    await transportsRepository.save(transport2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getTransports(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetTransportsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      TransportsRepository.getAllByUserIdAndSeriesId
    ).not.toHaveBeenCalled();
    expect(TransportsRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

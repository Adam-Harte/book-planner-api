import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockMagicSystem } from '../../mockData/magicSystems';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import {
  getMagicSystemsRepository,
  MagicSystemsRepository,
} from '../../repositories/magicSystems';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { getMagicSystems, GetMagicSystemsReqQuery } from './getMagicSystems';

describe('getMagicSystems', () => {
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
    MagicSystemsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        magicSystemsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    MagicSystemsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        magicSystemsRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all magic systems belonging to the user and a series', async () => {
    const fakeMagicSystem1 = generateMockMagicSystem(series);
    const fakeMagicSystem2 = generateMockMagicSystem(series);

    const magicSystem1 = await magicSystemsRepository.create(fakeMagicSystem1);
    await magicSystemsRepository.save(magicSystem1);

    const magicSystem2 = await magicSystemsRepository.create(fakeMagicSystem2);
    await magicSystemsRepository.save(magicSystem2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getMagicSystems(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetMagicSystemsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      MagicSystemsRepository.getAllByUserIdAndSeriesId
    ).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Magic Systems by user id and series id fetched.',
      data: [
        {
          id: magicSystem1.id,
          name: magicSystem1.name,
          description: magicSystem1.description,
          rules: magicSystem1.rules,
        },
        {
          id: magicSystem2.id,
          name: magicSystem2.name,
          description: magicSystem2.description,
          rules: magicSystem2.rules,
        },
      ],
    });
  });

  it('should get all magic systems belonging to the user and a book', async () => {
    const fakeMagicSystem1 = generateMockMagicSystem({}, [book]);
    const fakeMagicSystem2 = generateMockMagicSystem({}, [book]);

    const magicSystem1 = await magicSystemsRepository.create(fakeMagicSystem1);
    await magicSystemsRepository.save(magicSystem1);

    const magicSystem2 = await magicSystemsRepository.create(fakeMagicSystem2);
    await magicSystemsRepository.save(magicSystem2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getMagicSystems(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetMagicSystemsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Magic Systems by user id and book id fetched.',
      data: [
        {
          id: magicSystem1.id,
          name: magicSystem1.name,
          description: magicSystem1.description,
          rules: magicSystem1.rules,
        },
        {
          id: magicSystem2.id,
          name: magicSystem2.name,
          description: magicSystem2.description,
          rules: magicSystem2.rules,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeMagicSystem1 = generateMockMagicSystem(series);
    const fakeMagicSystem2 = generateMockMagicSystem(series);

    const magicSystem1 = await magicSystemsRepository.create(fakeMagicSystem1);
    await magicSystemsRepository.save(magicSystem1);

    const magicSystem2 = await magicSystemsRepository.create(fakeMagicSystem2);
    await magicSystemsRepository.save(magicSystem2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getMagicSystems(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetMagicSystemsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      MagicSystemsRepository.getAllByUserIdAndSeriesId
    ).not.toHaveBeenCalled();
    expect(
      MagicSystemsRepository.getAllByUserIdAndBookId
    ).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

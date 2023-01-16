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
import {
  getMagicSystemById,
  GetMagicSystemByIdReqParams,
  GetMagicSystemByIdReqQuery,
} from './getMagicSystemById';

describe('getMagicSystemById', () => {
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
    MagicSystemsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (magicSystemId: number, userId: number, seriesId: number) =>
          magicSystemsRepository.getByUserIdAndSeriesId(
            magicSystemId,
            userId,
            seriesId
          )
      );
    MagicSystemsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (magicSystemId: number, userId: number, bookId: number) =>
          magicSystemsRepository.getByUserIdAndBookId(
            magicSystemId,
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

  it('should fail if the magic system does not belong to the users series', async () => {
    const fakeMagicSystem = generateMockMagicSystem(series);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getMagicSystemById(
      req as unknown as Request<
        GetMagicSystemByIdReqParams,
        unknown,
        unknown,
        GetMagicSystemByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      2
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the magic system does not belong to the users book', async () => {
    const fakeMagicSystem = generateMockMagicSystem({}, [book]);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getMagicSystemById(
      req as unknown as Request<
        GetMagicSystemByIdReqParams,
        unknown,
        unknown,
        GetMagicSystemByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
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
    const fakeMagicSystem = generateMockMagicSystem(series);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getMagicSystemById(
      req as unknown as Request<
        GetMagicSystemByIdReqParams,
        unknown,
        unknown,
        GetMagicSystemByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      MagicSystemsRepository.getByUserIdAndSeriesId
    ).not.toHaveBeenCalled();
    expect(MagicSystemsRepository.getByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should get one magic system by a specific id and series id', async () => {
    const fakeMagicSystem = generateMockMagicSystem(series);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getMagicSystemById(
      req as unknown as Request<
        GetMagicSystemByIdReqParams,
        unknown,
        unknown,
        GetMagicSystemByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Magic System by id and series id fetched.',
      data: {
        id: magicSystem.id,
        name: magicSystem.name,
        description: magicSystem.description,
        rules: magicSystem.rules,
      },
    });
  });

  it('should get one magic system by a specific id and book id', async () => {
    const fakeMagicSystem = generateMockMagicSystem({}, [book]);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getMagicSystemById(
      req as unknown as Request<
        GetMagicSystemByIdReqParams,
        unknown,
        unknown,
        GetMagicSystemByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Magic System by id and book id fetched.',
      data: {
        id: magicSystem.id,
        name: magicSystem.name,
        description: magicSystem.description,
        rules: magicSystem.rules,
      },
    });
  });
});

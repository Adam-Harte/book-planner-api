import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { generateMockWorld } from '../../mockData/worlds';
import { getBooksRepository } from '../../repositories/books';
import { getSeriesRepository } from '../../repositories/series';
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
import { getWorlds, GetWorldsReqQuery } from './getWorlds';

describe('getWorlds', () => {
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
    WorldsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        worldsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    WorldsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        worldsRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all worlds belonging to the user and a series', async () => {
    const fakeWorld1 = generateMockWorld(series);
    const fakeWorld2 = generateMockWorld(series);

    const world1 = await worldsRepository.create(fakeWorld1);
    await worldsRepository.save(world1);

    const world2 = await worldsRepository.create(fakeWorld2);
    await worldsRepository.save(world2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getWorlds(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetWorldsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Worlds by user id and series id fetched.',
      data: [
        {
          id: world1.id,
          name: world1.name,
          description: world1.description,
        },
        {
          id: world2.id,
          name: world2.name,
          description: world2.description,
        },
      ],
    });
  });

  it('should get all worlds belonging to the user and a book', async () => {
    const fakeWorld1 = generateMockWorld({}, [book]);
    const fakeWorld2 = generateMockWorld({}, [book]);

    const world1 = await worldsRepository.create(fakeWorld1);
    await worldsRepository.save(world1);

    const world2 = await worldsRepository.create(fakeWorld2);
    await worldsRepository.save(world2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getWorlds(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetWorldsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Worlds by user id and book id fetched.',
      data: [
        {
          id: world1.id,
          name: world1.name,
          description: world1.description,
        },
        {
          id: world2.id,
          name: world2.name,
          description: world2.description,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeWorld1 = generateMockWorld(series, [book]);
    const fakeWorld2 = generateMockWorld(series, [book]);

    const world1 = await worldsRepository.create(fakeWorld1);
    await worldsRepository.save(world1);

    const world2 = await worldsRepository.create(fakeWorld2);
    await worldsRepository.save(world2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getWorlds(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetWorldsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.getAllByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(WorldsRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

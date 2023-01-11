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
import {
  updateWorldById,
  UpdateWorldReqBody,
  UpdateWorldReqParams,
  UpdateWorldReqQuery,
} from './updateWorldById';

describe('updateWorldById', () => {
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
    WorldsRepository.save = jest
      .fn()
      .mockImplementation((world: any) => worldsRepository.save(world));
    WorldsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((worldId: number, userId: number, seriesId: number) =>
        worldsRepository.getByUserIdAndSeriesId(worldId, userId, seriesId)
      );
    WorldsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((worldId: number, userId: number, bookId: number) =>
        worldsRepository.getByUserIdAndBookId(worldId, userId, bookId)
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
    const fakeWorld = generateMockWorld(series, [book]);
    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const req = getMockReq({
      params: {
        worldId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateWorldById(
      req as unknown as Request<
        UpdateWorldReqParams,
        unknown,
        UpdateWorldReqBody,
        UpdateWorldReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a world is not fetched by a series or book id', async () => {
    const fakeWorld = generateMockWorld(series, [book]);
    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const req = getMockReq({
      params: {
        worldId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateWorldById(
      req as unknown as Request<
        UpdateWorldReqParams,
        unknown,
        UpdateWorldReqBody,
        UpdateWorldReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a world by a specific id and series id', async () => {
    const fakeWorld = generateMockWorld(series);
    const updatedFakeWorld = generateMockWorld();

    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const req = getMockReq({
      params: {
        worldId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeWorld,
        },
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateWorldById(
      req as unknown as Request<
        UpdateWorldReqParams,
        unknown,
        UpdateWorldReqBody,
        UpdateWorldReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeWorld)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'World updated.',
      data: {
        id: 1,
        name: updatedFakeWorld.name,
        description: updatedFakeWorld.description,
      },
    });
  });

  it('should update a world by a specific id and book id', async () => {
    const fakeWorld = generateMockWorld({}, [book]);
    const updatedFakeWorld = generateMockWorld();

    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const req = getMockReq({
      params: {
        worldId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeWorld,
        },
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateWorldById(
      req as unknown as Request<
        UpdateWorldReqParams,
        unknown,
        UpdateWorldReqBody,
        UpdateWorldReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WorldsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeWorld)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'World updated.',
      data: {
        id: 1,
        name: updatedFakeWorld.name,
        description: updatedFakeWorld.description,
      },
    });
  });
});

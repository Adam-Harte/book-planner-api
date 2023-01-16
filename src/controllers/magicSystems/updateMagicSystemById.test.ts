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
  updateMagicSystemById,
  UpdateMagicSystemReqBody,
  UpdateMagicSystemReqParams,
  UpdateMagicSystemReqQuery,
} from './updateMagicSystemById';

describe('updateMagicSystemById', () => {
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
    MagicSystemsRepository.save = jest
      .fn()
      .mockImplementation((magicSystem: any) =>
        magicSystemsRepository.save(magicSystem)
      );
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeMagicSystem = generateMockMagicSystem(series, [book]);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateMagicSystemById(
      req as unknown as Request<
        UpdateMagicSystemReqParams,
        unknown,
        UpdateMagicSystemReqBody,
        UpdateMagicSystemReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a magic system is not fetched by a series or book id', async () => {
    const fakeMagicSystem = generateMockMagicSystem(series, [book]);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateMagicSystemById(
      req as unknown as Request<
        UpdateMagicSystemReqParams,
        unknown,
        UpdateMagicSystemReqBody,
        UpdateMagicSystemReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a magic system by a specific id and series id', async () => {
    const fakeMagicSystem = generateMockMagicSystem(series);
    const updatedFakeMagicSystem = generateMockMagicSystem();
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      query: {
        seriesId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeMagicSystem,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateMagicSystemById(
      req as unknown as Request<
        UpdateMagicSystemReqParams,
        unknown,
        UpdateMagicSystemReqBody,
        UpdateMagicSystemReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeMagicSystem)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Magic System updated.',
      data: {
        id: 1,
        name: updatedFakeMagicSystem.name,
        description: updatedFakeMagicSystem.description,
        rules: updatedFakeMagicSystem.rules,
      },
    });
  });

  it('should update a magic system by a specific id and book id', async () => {
    const fakeMagicSystem = generateMockMagicSystem({}, [book]);
    const updatedFakeMagicSystem = generateMockMagicSystem();
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const req = getMockReq({
      params: {
        magicSystemId: '1',
      },
      query: {
        bookId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeMagicSystem,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateMagicSystemById(
      req as unknown as Request<
        UpdateMagicSystemReqParams,
        unknown,
        UpdateMagicSystemReqBody,
        UpdateMagicSystemReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(MagicSystemsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeMagicSystem)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Magic System updated.',
      data: {
        id: 1,
        name: updatedFakeMagicSystem.name,
        description: updatedFakeMagicSystem.description,
        rules: updatedFakeMagicSystem.rules,
      },
    });
  });
});

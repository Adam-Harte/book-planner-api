import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockCreature } from '../../mockData/creatures';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import {
  CreaturesRepository,
  getCreaturesRepository,
} from '../../repositories/creatures';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  deleteCreatureById,
  DeleteCreatureReqParams,
  DeleteCreatureReqQuery,
} from './deleteCreatureById';

describe('deleteCreatureById', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let creaturesRepository: any;
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
    creaturesRepository = getCreaturesRepository(testDataSource);
    CreaturesRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => creaturesRepository.delete(id));
    CreaturesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (creatureId: number, userId: number, seriesId: number) =>
          creaturesRepository.getByUserIdAndSeriesId(
            creatureId,
            userId,
            seriesId
          )
      );
    CreaturesRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (creatureId: number, userId: number, bookId: number) =>
          creaturesRepository.getByUserIdAndBookId(creatureId, userId, bookId)
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

  it('should fail if neither seriesId or bookId query params are passed', async () => {
    const fakeCreature = generateMockCreature(series, [book]);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const req = getMockReq({
      params: {
        creatureId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteCreatureById(
      req as unknown as Request<
        DeleteCreatureReqParams,
        unknown,
        unknown,
        DeleteCreatureReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if the creature being deleted does not belong to a series', async () => {
    const fakeCreature = generateMockCreature(series);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const req = getMockReq({
      params: {
        creatureId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteCreatureById(
      req as unknown as Request<
        DeleteCreatureReqParams,
        unknown,
        unknown,
        DeleteCreatureReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the creature being deleted does not belong to a book', async () => {
    const fakeCreature = generateMockCreature({}, [book]);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const req = getMockReq({
      params: {
        creatureId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteCreatureById(
      req as unknown as Request<
        DeleteCreatureReqParams,
        unknown,
        unknown,
        DeleteCreatureReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should delete the creature by a specific id', async () => {
    const fakeCreature = generateMockCreature({}, [book]);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const req = getMockReq({
      params: {
        creatureId: '1',
      },
      query: {
        seriesId: '1',
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteCreatureById(
      req as unknown as Request<
        DeleteCreatureReqParams,
        unknown,
        unknown,
        DeleteCreatureReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.delete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Creature deleted.',
    });
  });
});

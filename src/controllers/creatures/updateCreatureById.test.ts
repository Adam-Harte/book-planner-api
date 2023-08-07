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
  updateCreatureById,
  UpdateCreatureReqBody,
  UpdateCreatureReqParams,
  UpdateCreatureReqQuery,
} from './updateCreatureById';

describe('updateCreatureById', () => {
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
    CreaturesRepository.save = jest
      .fn()
      .mockImplementation((creature: any) =>
        creaturesRepository.save(creature)
      );
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
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

    await updateCreatureById(
      req as unknown as Request<
        UpdateCreatureReqParams,
        unknown,
        UpdateCreatureReqBody,
        UpdateCreatureReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a creature is not fetched by a series or book id', async () => {
    const fakeCreature = generateMockCreature(series, [book]);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const req = getMockReq({
      params: {
        creatureId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateCreatureById(
      req as unknown as Request<
        UpdateCreatureReqParams,
        unknown,
        UpdateCreatureReqBody,
        UpdateCreatureReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a creature by a specific id and series id', async () => {
    const fakeCreature = generateMockCreature(series);
    const updatedFakeCreature = generateMockCreature();

    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const req = getMockReq({
      params: {
        creatureId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeCreature,
        },
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateCreatureById(
      req as unknown as Request<
        UpdateCreatureReqParams,
        unknown,
        UpdateCreatureReqBody,
        UpdateCreatureReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeCreature)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Creature updated.',
      data: {
        id: 1,
        name: updatedFakeCreature.name,
        personalityDescription: updatedFakeCreature.personalityDescription,
        physicalDescription: updatedFakeCreature.physicalDescription,
      },
    });
  });

  it('should update a creature by a specific id and book id', async () => {
    const fakeCreature = generateMockCreature({}, [book]);
    const updatedFakeCreature = generateMockCreature();

    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const req = getMockReq({
      params: {
        creatureId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeCreature,
        },
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateCreatureById(
      req as unknown as Request<
        UpdateCreatureReqParams,
        unknown,
        UpdateCreatureReqBody,
        UpdateCreatureReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeCreature)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Creature updated.',
      data: {
        id: 1,
        name: updatedFakeCreature.name,
        personalityDescription: updatedFakeCreature.personalityDescription,
        physicalDescription: updatedFakeCreature.physicalDescription,
      },
    });
  });
});

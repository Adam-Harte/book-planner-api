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
import { getCreatures, GetCreaturesReqQuery } from './getCreatures';

describe('getCreatures', () => {
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
    CreaturesRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        creaturesRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    CreaturesRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        creaturesRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all creatures belonging to the user and a series', async () => {
    const fakeCreature1 = generateMockCreature(series);
    const fakeCreature2 = generateMockCreature(series);

    const creature1 = await creaturesRepository.create(fakeCreature1);
    await creaturesRepository.save(creature1);

    const creature2 = await creaturesRepository.create(fakeCreature2);
    await creaturesRepository.save(creature2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getCreatures(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetCreaturesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Creatures by user id and series id fetched.',
      data: [
        {
          id: creature1.id,
          name: creature1.name,
          personalityDescription: creature1.personalityDescription,
          physicalDescription: creature1.physicalDescription,
        },
        {
          id: creature2.id,
          name: creature2.name,
          personalityDescription: creature2.personalityDescription,
          physicalDescription: creature2.physicalDescription,
        },
      ],
    });
  });

  it('should get all creatures belonging to the user and a book', async () => {
    const fakeCreature1 = generateMockCreature({}, [book]);
    const fakeCreature2 = generateMockCreature({}, [book]);

    const creature1 = await creaturesRepository.create(fakeCreature1);
    await creaturesRepository.save(creature1);

    const creature2 = await creaturesRepository.create(fakeCreature2);
    await creaturesRepository.save(creature2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getCreatures(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetCreaturesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CreaturesRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Creatures by user id and book id fetched.',
      data: [
        {
          id: creature1.id,
          name: creature1.name,
          personalityDescription: creature1.personalityDescription,
          physicalDescription: creature1.physicalDescription,
        },
        {
          id: creature2.id,
          name: creature2.name,
          personalityDescription: creature2.personalityDescription,
          physicalDescription: creature2.physicalDescription,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeCreature1 = generateMockCreature(series, [book]);
    const fakeCreature2 = generateMockCreature(series, [book]);

    const creature1 = await creaturesRepository.create(fakeCreature1);
    await creaturesRepository.save(creature1);

    const creature2 = await creaturesRepository.create(fakeCreature2);
    await creaturesRepository.save(creature2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getCreatures(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetCreaturesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      CreaturesRepository.getAllByUserIdAndSeriesId
    ).not.toHaveBeenCalled();
    expect(CreaturesRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

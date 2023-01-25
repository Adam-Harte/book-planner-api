import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockBattle } from '../../mockData/battles';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import { getSeriesRepository } from '../../repositories/series';
import {
  getBattlesRepository,
  BattlesRepository,
} from '../../repositories/battles';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { getBattles, GetBattlesReqQuery } from './getBattles';

describe('getBattles', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let battlesRepository: any;
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
    battlesRepository = getBattlesRepository(testDataSource);
    BattlesRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        battlesRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    BattlesRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        battlesRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all battles belonging to the user and a series', async () => {
    const fakeBattle1 = generateMockBattle(series);
    const fakeBattle2 = generateMockBattle(series);

    const battle1 = await battlesRepository.create(fakeBattle1);
    await battlesRepository.save(battle1);

    const battle2 = await battlesRepository.create(fakeBattle2);
    await battlesRepository.save(battle2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getBattles(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetBattlesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Battles by user id and series id fetched.',
      data: [
        {
          id: battle1.id,
          name: battle1.name,
          start: battle1.start,
          end: battle1.end,
          description: battle1.description,
        },
        {
          id: battle2.id,
          name: battle2.name,
          start: battle2.start,
          end: battle2.end,
          description: battle2.description,
        },
      ],
    });
  });

  it('should get all battles belonging to the user and a book', async () => {
    const fakeBattle1 = generateMockBattle({}, [book]);
    const fakeBattle2 = generateMockBattle({}, [book]);

    const battle1 = await battlesRepository.create(fakeBattle1);
    await battlesRepository.save(battle1);

    const battle2 = await battlesRepository.create(fakeBattle2);
    await battlesRepository.save(battle2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getBattles(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetBattlesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Battles by user id and book id fetched.',
      data: [
        {
          id: battle1.id,
          name: battle1.name,
          start: battle1.start,
          end: battle1.end,
          description: battle1.description,
        },
        {
          id: battle2.id,
          name: battle2.name,
          start: battle2.start,
          end: battle2.end,
          description: battle2.description,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeBattle1 = generateMockBattle(series);
    const fakeBattle2 = generateMockBattle(series);

    const battle1 = await battlesRepository.create(fakeBattle1);
    await battlesRepository.save(battle1);

    const battle2 = await battlesRepository.create(fakeBattle2);
    await battlesRepository.save(battle2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getBattles(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetBattlesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.getAllByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(BattlesRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

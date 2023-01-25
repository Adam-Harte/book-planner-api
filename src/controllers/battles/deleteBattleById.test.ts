import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBattle } from '../../mockData/battles';
import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import {
  BattlesRepository,
  getBattlesRepository,
} from '../../repositories/battles';
import { getBooksRepository } from '../../repositories/books';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  deleteBattleById,
  DeleteBattleReqParams,
  DeleteBattleReqQuery,
} from './deleteBattleById';

describe('deleteBattleById', () => {
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
    BattlesRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => battlesRepository.delete(id));
    BattlesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (battleId: number, userId: number, seriesId: number) =>
          battlesRepository.getByUserIdAndSeriesId(battleId, userId, seriesId)
      );
    BattlesRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((battleId: number, userId: number, bookId: number) =>
        battlesRepository.getByUserIdAndBookId(battleId, userId, bookId)
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
    const fakeBattle = generateMockBattle(series, [book]);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const req = getMockReq({
      params: {
        battleId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteBattleById(
      req as unknown as Request<
        DeleteBattleReqParams,
        unknown,
        unknown,
        DeleteBattleReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if the battle being deleted does not belong to a series', async () => {
    const fakeBattle = generateMockBattle(series);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const req = getMockReq({
      params: {
        battleId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteBattleById(
      req as unknown as Request<
        DeleteBattleReqParams,
        unknown,
        unknown,
        DeleteBattleReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the battle being deleted does not belong to a book', async () => {
    const fakeBattle = generateMockBattle({}, [book]);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const req = getMockReq({
      params: {
        battleId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteBattleById(
      req as unknown as Request<
        DeleteBattleReqParams,
        unknown,
        unknown,
        DeleteBattleReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should delete the battle by a specific id', async () => {
    const fakeBattle = generateMockBattle(series, [book]);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const req = getMockReq({
      params: {
        battleId: '1',
      },
      query: {
        seriesId: '1',
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteBattleById(
      req as unknown as Request<
        DeleteBattleReqParams,
        unknown,
        unknown,
        DeleteBattleReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.delete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Battle deleted.',
    });
  });
});

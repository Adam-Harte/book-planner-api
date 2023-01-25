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
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  createBattle,
  CreateBattleReqBody,
  CreateBattleReqQuery,
} from './createBattle';

describe('createBattle', () => {
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
    SeriesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        seriesRepository.getByUserIdAndSeriesId(userId, seriesId)
      );
    BooksRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        booksRepository.getByUserIdAndBookId(userId, bookId)
      );
    BattlesRepository.create = jest
      .fn()
      .mockImplementation((battle: any) => battlesRepository.create(battle));
    BattlesRepository.save = jest
      .fn()
      .mockImplementation((battle: any) => battlesRepository.save(battle));
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

  it('fails if neither the seriesId or bookId query params are passed', async () => {
    const fakeBattle = generateMockBattle();
    const req = getMockReq({
      body: {
        name: fakeBattle.name,
        start: fakeBattle.start,
        end: fakeBattle.end,
        description: fakeBattle.description,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createBattle(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateBattleReqBody,
        CreateBattleReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.create).not.toHaveBeenCalled();
    expect(BattlesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new battle belonging to a series', async () => {
    const fakeBattle = generateMockBattle();
    const req = getMockReq({
      body: {
        name: fakeBattle.name,
        start: fakeBattle.start,
        end: fakeBattle.end,
        description: fakeBattle.description,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createBattle(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateBattleReqBody,
        CreateBattleReqQuery,
        Record<string, any>
      >,
      res as Response
    );
    expect(BattlesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      start: req.body.start,
      end: req.body.end,
      description: req.body.description,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(BattlesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        start: req.body.start,
        end: req.body.end,
        description: req.body.description,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Battle created.',
      data: {
        id: 1,
        name: fakeBattle.name,
        start: fakeBattle.start,
        end: fakeBattle.end,
        description: fakeBattle.description,
      },
    });
  });

  it('should create a new battle belonging to a book', async () => {
    const fakeBattle = generateMockBattle();
    const req = getMockReq({
      body: {
        name: fakeBattle.name,
        start: fakeBattle.start,
        end: fakeBattle.end,
        description: fakeBattle.description,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createBattle(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateBattleReqBody,
        CreateBattleReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      start: req.body.start,
      end: req.body.end,
      description: req.body.description,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(BattlesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        start: req.body.start,
        end: req.body.end,
        description: req.body.description,
        books: [
          expect.objectContaining({
            id: 1,
            name: fakeBook.name,
            genre: fakeBook.genre,
          }),
        ],
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Battle created.',
      data: {
        id: 1,
        name: fakeBattle.name,
        start: fakeBattle.start,
        end: fakeBattle.end,
        description: fakeBattle.description,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the battle', async () => {
    const fakeBattle = generateMockBattle();
    const req = getMockReq({
      body: {
        name: fakeBattle.name,
        start: fakeBattle.start,
        end: fakeBattle.end,
        description: fakeBattle.description,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createBattle(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateBattleReqBody,
        CreateBattleReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(BattlesRepository.create).not.toHaveBeenCalled();
    expect(BattlesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A battle must be created belonging to one of your series or books.',
    });
  });
});

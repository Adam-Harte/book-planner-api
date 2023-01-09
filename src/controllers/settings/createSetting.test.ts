import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockSetting } from '../../mockData/settings';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
import {
  getSettingsRepository,
  SettingsRepository,
} from '../../repositories/settings';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { createSetting } from './createSetting';

describe('createSetting', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let settingsRepository: any;
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
    settingsRepository = getSettingsRepository(testDataSource);
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
    SettingsRepository.create = jest
      .fn()
      .mockImplementation((setting: any) => settingsRepository.create(setting));
    SettingsRepository.save = jest
      .fn()
      .mockImplementation((setting: any) => settingsRepository.save(setting));
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
    const fakeSetting = generateMockSetting();
    const req = getMockReq({
      body: {
        name: fakeSetting.name,
        description: fakeSetting.description,
        type: fakeSetting.type,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createSetting(req as Request, res as Response);

    expect(SettingsRepository.create).not.toHaveBeenCalled();
    expect(SettingsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new setting belonging to a series', async () => {
    const fakeSetting = generateMockSetting();
    const req = getMockReq({
      body: {
        name: fakeSetting.name,
        description: fakeSetting.description,
        type: fakeSetting.type,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createSetting(req as Request, res as Response);

    expect(SettingsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(SettingsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Setting created.',
      data: {
        id: 1,
        name: fakeSetting.name,
        description: fakeSetting.description,
        type: fakeSetting.type,
      },
    });
  });

  it('should create a new Setting belonging to a book', async () => {
    const fakeSetting = generateMockSetting();
    const req = getMockReq({
      body: {
        name: fakeSetting.name,
        description: fakeSetting.description,
        type: fakeSetting.type,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createSetting(req as Request, res as Response);

    expect(SettingsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(SettingsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        type: req.body.type,
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
      message: 'Setting created.',
      data: {
        id: 1,
        name: fakeSetting.name,
        description: fakeSetting.description,
        type: fakeSetting.type,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the setting', async () => {
    const fakeSetting = generateMockSetting();
    const req = getMockReq({
      body: {
        name: fakeSetting.name,
        description: fakeSetting.description,
        type: fakeSetting.type,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createSetting(req as Request, res as Response);

    expect(SettingsRepository.create).not.toHaveBeenCalled();
    expect(SettingsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A setting must be created belonging to one of your series or books.',
    });
  });
});

import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockSetting } from '../../mockData/settings';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import { getSeriesRepository } from '../../repositories/series';
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
import { getSettings, GetSettingsReqQuery } from './getSettings';

describe('getSettings', () => {
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
    SettingsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        settingsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    SettingsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        settingsRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all settings belonging to the user and a series', async () => {
    const fakeSetting1 = generateMockSetting(series);
    const fakeSetting2 = generateMockSetting(series);

    const setting1 = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting1);

    const setting2 = await settingsRepository.create(fakeSetting2);
    await settingsRepository.save(setting2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getSettings(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetSettingsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Settings by user id and series id fetched.',
      data: [
        {
          id: setting1.id,
          name: setting1.name,
          description: setting1.description,
          type: setting1.type,
        },
        {
          id: setting2.id,
          name: setting2.name,
          description: setting2.description,
          type: setting2.type,
        },
      ],
    });
  });

  it('should get all settings belonging to the user and a book', async () => {
    const fakeSetting1 = generateMockSetting({}, [book]);
    const fakeSetting2 = generateMockSetting({}, [book]);

    const setting1 = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting1);

    const setting2 = await settingsRepository.create(fakeSetting2);
    await settingsRepository.save(setting2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getSettings(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetSettingsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Settings by user id and book id fetched.',
      data: [
        {
          id: setting1.id,
          name: setting1.name,
          description: setting1.description,
          type: setting1.type,
        },
        {
          id: setting2.id,
          name: setting2.name,
          description: setting2.description,
          type: setting2.type,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeSetting1 = generateMockSetting(series, [book]);
    const fakeSetting2 = generateMockSetting(series, [book]);

    const setting1 = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting1);

    const setting2 = await settingsRepository.create(fakeSetting2);
    await settingsRepository.save(setting2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getSettings(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetSettingsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.getAllByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(SettingsRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

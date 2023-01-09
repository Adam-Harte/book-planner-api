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
import {
  getSettingById,
  GetSettingByIdReqParams,
  GetSettingByIdReqQuery,
} from './getSettingById';

describe('getSettingById', () => {
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
    SettingsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (settingId: number, userId: number, seriesId: number) =>
          settingsRepository.getByUserIdAndSeriesId(settingId, userId, seriesId)
      );
    SettingsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((settingId: number, userId: number, bookId: number) =>
        settingsRepository.getByUserIdAndBookId(settingId, userId, bookId)
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

  it('should fail if the setting does not belong to the users series', async () => {
    const fakeSetting = generateMockSetting(series);
    const setting = await settingsRepository.create(fakeSetting);
    await settingsRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getSettingById(
      req as unknown as Request<
        GetSettingByIdReqParams,
        unknown,
        unknown,
        GetSettingByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      2
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the setting does not belong to the users book', async () => {
    const fakeSetting = generateMockSetting({}, [book]);
    const setting = await settingsRepository.create(fakeSetting);
    await settingsRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getSettingById(
      req as unknown as Request<
        GetSettingByIdReqParams,
        unknown,
        unknown,
        GetSettingByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1,
      2
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if neither seriesId or bookId query params are passed', async () => {
    const fakeSetting = generateMockSetting(series, [book]);
    const setting = await settingsRepository.create(fakeSetting);
    await settingsRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getSettingById(
      req as unknown as Request<
        GetSettingByIdReqParams,
        unknown,
        unknown,
        GetSettingByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.getByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(SettingsRepository.getByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should get one setting by a specific id and series id', async () => {
    const fakeSetting = generateMockSetting(series);
    const setting = await settingsRepository.create(fakeSetting);
    await settingsRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getSettingById(
      req as unknown as Request<
        GetSettingByIdReqParams,
        unknown,
        unknown,
        GetSettingByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Setting by id and series id fetched.',
      data: {
        id: setting.id,
        name: setting.name,
        description: setting.description,
        type: setting.type,
      },
    });
  });

  it('should get one setting by a specific id and book id', async () => {
    const fakeSetting = generateMockSetting({}, [book]);
    const setting = await settingsRepository.create(fakeSetting);
    await settingsRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getSettingById(
      req as unknown as Request<
        GetSettingByIdReqParams,
        unknown,
        unknown,
        GetSettingByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Setting by id and book id fetched.',
      data: {
        id: setting.id,
        name: setting.name,
        description: setting.description,
        type: setting.type,
      },
    });
  });
});

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
  updateSettingById,
  UpdateSettingReqBody,
  UpdateSettingReqParams,
  UpdateSettingReqQuery,
} from './updateSettingById';

describe('updateSettingById', () => {
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
    SettingsRepository.save = jest
      .fn()
      .mockImplementation((setting: any) => settingsRepository.save(setting));
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
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

    await updateSettingById(
      req as unknown as Request<
        UpdateSettingReqParams,
        unknown,
        UpdateSettingReqBody,
        UpdateSettingReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a setting is not fetched by a series or book id', async () => {
    const fakeSetting = generateMockSetting(series, [book]);
    const setting = await settingsRepository.create(fakeSetting);
    await settingsRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateSettingById(
      req as unknown as Request<
        UpdateSettingReqParams,
        unknown,
        UpdateSettingReqBody,
        UpdateSettingReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a setting by a specific id and series id', async () => {
    const fakeSetting = generateMockSetting(series, [book]);
    const updatedFakeSetting = generateMockSetting();

    const setting = await settingsRepository.create(fakeSetting);
    await settingsRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeSetting,
        },
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateSettingById(
      req as unknown as Request<
        UpdateSettingReqParams,
        unknown,
        UpdateSettingReqBody,
        UpdateSettingReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeSetting)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Setting updated.',
      data: {
        id: 1,
        name: updatedFakeSetting.name,
        description: updatedFakeSetting.description,
        type: updatedFakeSetting.type,
      },
    });
  });

  it('should update a setting by a specific id and book id', async () => {
    const fakeSetting = generateMockSetting({}, [book]);
    const updatedFakeSetting = generateMockSetting();

    const setting = await settingsRepository.create(fakeSetting);
    await settingsRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeSetting,
        },
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateSettingById(
      req as unknown as Request<
        UpdateSettingReqParams,
        unknown,
        UpdateSettingReqBody,
        UpdateSettingReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeSetting)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Setting updated.',
      data: {
        id: 1,
        name: updatedFakeSetting.name,
        description: updatedFakeSetting.description,
        type: updatedFakeSetting.type,
      },
    });
  });
});

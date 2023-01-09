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
  deleteSettingById,
  DeleteSettingReqParams,
  DeleteSettingReqQuery,
} from './deleteSettingById';

describe('deleteSettingById', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let settingRepository: any;
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
    settingRepository = getSettingsRepository(testDataSource);
    SettingsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => settingRepository.delete(id));
    SettingsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (settingId: number, userId: number, seriesId: number) =>
          settingRepository.getByUserIdAndSeriesId(settingId, userId, seriesId)
      );
    SettingsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((settingId: number, userId: number, bookId: number) =>
        settingRepository.getByUserIdAndBookId(settingId, userId, bookId)
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
    const fakeSetting = generateMockSetting(series, [book]);
    const setting = await settingRepository.create(fakeSetting);
    await settingRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteSettingById(
      req as unknown as Request<
        DeleteSettingReqParams,
        unknown,
        unknown,
        DeleteSettingReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if the setting being deleted does not belong to a series', async () => {
    const fakeSetting = generateMockSetting(series);
    const setting = await settingRepository.create(fakeSetting);
    await settingRepository.save(setting);

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

    await deleteSettingById(
      req as unknown as Request<
        DeleteSettingReqParams,
        unknown,
        unknown,
        DeleteSettingReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the setting being deleted does not belong to a book', async () => {
    const fakeSetting = generateMockSetting({}, [book]);
    const setting = await settingRepository.create(fakeSetting);
    await settingRepository.save(setting);

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

    await deleteSettingById(
      req as unknown as Request<
        DeleteSettingReqParams,
        unknown,
        unknown,
        DeleteSettingReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should delete the setting by a specific id', async () => {
    const fakeSetting = generateMockSetting({}, [book]);
    const setting = await settingRepository.create(fakeSetting);
    await settingRepository.save(setting);

    const req = getMockReq({
      params: {
        settingId: '1',
      },
      query: {
        seriesId: '1',
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteSettingById(
      req as unknown as Request<
        DeleteSettingReqParams,
        unknown,
        unknown,
        DeleteSettingReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(SettingsRepository.delete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Setting deleted.',
    });
  });
});

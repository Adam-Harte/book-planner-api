import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { generateMockWeapon } from '../../mockData/weapons';
import { getBooksRepository } from '../../repositories/books';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  getWeaponsRepository,
  WeaponsRepository,
} from '../../repositories/weapons';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  updateWeaponById,
  UpdateWeaponReqBody,
  UpdateWeaponReqParams,
  UpdateWeaponReqQuery,
} from './updateWeaponById';

describe('updateWeaponById', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let weaponsRepository: any;
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
    weaponsRepository = getWeaponsRepository(testDataSource);
    WeaponsRepository.save = jest
      .fn()
      .mockImplementation((weapon: any) => weaponsRepository.save(weapon));
    WeaponsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (weaponId: number, userId: number, seriesId: number) =>
          weaponsRepository.getByUserIdAndSeriesId(weaponId, userId, seriesId)
      );
    WeaponsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((weaponId: number, userId: number, bookId: number) =>
        weaponsRepository.getByUserIdAndBookId(weaponId, userId, bookId)
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
    const fakeWeapon = generateMockWeapon(series, [book]);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateWeaponById(
      req as unknown as Request<
        UpdateWeaponReqParams,
        unknown,
        UpdateWeaponReqBody,
        UpdateWeaponReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a weapon is not fetched by a series or book id', async () => {
    const fakeWeapon = generateMockWeapon(series, [book]);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateWeaponById(
      req as unknown as Request<
        UpdateWeaponReqParams,
        unknown,
        UpdateWeaponReqBody,
        UpdateWeaponReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a weapon by a specific id and series id', async () => {
    const fakeWeapon = generateMockWeapon(series);
    const updatedFakeWeapon = generateMockWeapon();
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      query: {
        seriesId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeWeapon,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateWeaponById(
      req as unknown as Request<
        UpdateWeaponReqParams,
        unknown,
        UpdateWeaponReqBody,
        UpdateWeaponReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeWeapon)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Weapon updated.',
      data: {
        id: 1,
        name: updatedFakeWeapon.name,
        description: updatedFakeWeapon.description,
        creator: updatedFakeWeapon.creator,
        wielder: updatedFakeWeapon.wielder,
        forged: updatedFakeWeapon.forged,
      },
    });
  });

  it('should update a weapon by a specific id and book id', async () => {
    const fakeWeapon = generateMockWeapon({}, [book]);
    const updatedFakeWeapon = generateMockWeapon();
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      query: {
        bookId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeWeapon,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateWeaponById(
      req as unknown as Request<
        UpdateWeaponReqParams,
        unknown,
        UpdateWeaponReqBody,
        UpdateWeaponReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeWeapon)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Weapon updated.',
      data: {
        id: 1,
        name: updatedFakeWeapon.name,
        description: updatedFakeWeapon.description,
        creator: updatedFakeWeapon.creator,
        wielder: updatedFakeWeapon.wielder,
        forged: updatedFakeWeapon.forged,
      },
    });
  });
});

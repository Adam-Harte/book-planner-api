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
  getWeaponById,
  GetWeaponByIdReqParams,
  GetWeaponByIdReqQuery,
} from './getWeaponById';

describe('getWeaponById', () => {
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

  it('should fail if the weapon does not belong to the users series', async () => {
    const fakeWeapon = generateMockWeapon(series);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getWeaponById(
      req as unknown as Request<
        GetWeaponByIdReqParams,
        unknown,
        unknown,
        GetWeaponByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      2
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the magic system does not belong to the users book', async () => {
    const fakeWeapon = generateMockWeapon({}, [book]);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getWeaponById(
      req as unknown as Request<
        GetWeaponByIdReqParams,
        unknown,
        unknown,
        GetWeaponByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
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
    const fakeWeapon = generateMockWeapon(series);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getWeaponById(
      req as unknown as Request<
        GetWeaponByIdReqParams,
        unknown,
        unknown,
        GetWeaponByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.getByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(WeaponsRepository.getByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should get one weapon by a specific id and series id', async () => {
    const fakeWeapon = generateMockWeapon(series);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getWeaponById(
      req as unknown as Request<
        GetWeaponByIdReqParams,
        unknown,
        unknown,
        GetWeaponByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Weapon by id and series id fetched.',
      data: {
        id: weapon.id,
        name: weapon.name,
        description: weapon.description,
        creator: weapon.creator,
        wielder: weapon.wielder,
        forged: weapon.forged,
      },
    });
  });

  it('should get one weapon by a specific id and book id', async () => {
    const fakeWeapon = generateMockWeapon({}, [book]);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const req = getMockReq({
      params: {
        weaponId: '1',
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getWeaponById(
      req as unknown as Request<
        GetWeaponByIdReqParams,
        unknown,
        unknown,
        GetWeaponByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Weapon by id and book id fetched.',
      data: {
        id: weapon.id,
        name: weapon.name,
        description: weapon.description,
        creator: weapon.creator,
        wielder: weapon.wielder,
        forged: weapon.forged,
      },
    });
  });
});

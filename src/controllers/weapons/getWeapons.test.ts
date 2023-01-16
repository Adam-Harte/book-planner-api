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
import { getWeapons, GetWeaponsReqQuery } from './getWeapons';

describe('getWeapons', () => {
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
    WeaponsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        weaponsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    WeaponsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        weaponsRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all weapons belonging to the user and a series', async () => {
    const fakeWeapon1 = generateMockWeapon(series);
    const fakeWeapon2 = generateMockWeapon(series);

    const weapon1 = await weaponsRepository.create(fakeWeapon1);
    await weaponsRepository.save(weapon1);

    const weapon2 = await weaponsRepository.create(fakeWeapon2);
    await weaponsRepository.save(weapon2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getWeapons(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetWeaponsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Weapons by user id and series id fetched.',
      data: [
        {
          id: weapon1.id,
          name: weapon1.name,
          description: weapon1.description,
          creator: weapon1.creator,
          wielder: weapon1.wielder,
          forged: weapon1.forged,
        },
        {
          id: weapon2.id,
          name: weapon2.name,
          description: weapon2.description,
          creator: weapon2.creator,
          wielder: weapon2.wielder,
          forged: weapon2.forged,
        },
      ],
    });
  });

  it('should get all weapons belonging to the user and a book', async () => {
    const fakeWeapon1 = generateMockWeapon({}, [book]);
    const fakeWeapon2 = generateMockWeapon({}, [book]);

    const weapon1 = await weaponsRepository.create(fakeWeapon1);
    await weaponsRepository.save(weapon1);

    const weapon2 = await weaponsRepository.create(fakeWeapon2);
    await weaponsRepository.save(weapon2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getWeapons(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetWeaponsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Weapons by user id and book id fetched.',
      data: [
        {
          id: weapon1.id,
          name: weapon1.name,
          description: weapon1.description,
          creator: weapon1.creator,
          wielder: weapon1.wielder,
          forged: weapon1.forged,
        },
        {
          id: weapon2.id,
          name: weapon2.name,
          description: weapon2.description,
          creator: weapon2.creator,
          wielder: weapon2.wielder,
          forged: weapon2.forged,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeWeapon1 = generateMockWeapon(series);
    const fakeWeapon2 = generateMockWeapon(series);

    const weapon1 = await weaponsRepository.create(fakeWeapon1);
    await weaponsRepository.save(weapon1);

    const weapon2 = await weaponsRepository.create(fakeWeapon2);
    await weaponsRepository.save(weapon2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getWeapons(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetWeaponsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.getAllByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(WeaponsRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

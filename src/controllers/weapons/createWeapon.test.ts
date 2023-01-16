import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { generateMockWeapon } from '../../mockData/weapons';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
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
  createWeapon,
  CreateWeaponReqBody,
  CreateWeaponReqQuery,
} from './createWeapon';

describe('createWeapon', () => {
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
    WeaponsRepository.create = jest
      .fn()
      .mockImplementation((weapon: any) => weaponsRepository.create(weapon));
    WeaponsRepository.save = jest
      .fn()
      .mockImplementation((weapon: any) => weaponsRepository.save(weapon));
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
    const fakeWeapon = generateMockWeapon();
    const req = getMockReq({
      body: {
        name: fakeWeapon.name,
        description: fakeWeapon.description,
        creator: fakeWeapon.creator,
        wielder: fakeWeapon.wielder,
        forged: fakeWeapon.forged,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createWeapon(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateWeaponReqBody,
        CreateWeaponReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.create).not.toHaveBeenCalled();
    expect(WeaponsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new weapon belonging to a series', async () => {
    const fakeWeapon = generateMockWeapon();
    const req = getMockReq({
      body: {
        name: fakeWeapon.name,
        description: fakeWeapon.description,
        creator: fakeWeapon.creator,
        wielder: fakeWeapon.wielder,
        forged: fakeWeapon.forged,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createWeapon(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateWeaponReqBody,
        CreateWeaponReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      creator: req.body.creator,
      wielder: req.body.wielder,
      forged: req.body.forged,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(WeaponsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        creator: req.body.creator,
        wielder: req.body.wielder,
        forged: req.body.forged,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Weapon created.',
      data: {
        id: 1,
        name: fakeWeapon.name,
        description: fakeWeapon.description,
        creator: fakeWeapon.creator,
        wielder: fakeWeapon.wielder,
        forged: fakeWeapon.forged,
      },
    });
  });

  it('should create a new weapon belonging to a book', async () => {
    const fakeWeapon = generateMockWeapon();
    const req = getMockReq({
      body: {
        name: fakeWeapon.name,
        description: fakeWeapon.description,
        creator: fakeWeapon.creator,
        wielder: fakeWeapon.wielder,
        forged: fakeWeapon.forged,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createWeapon(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateWeaponReqBody,
        CreateWeaponReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      description: req.body.description,
      creator: req.body.creator,
      wielder: req.body.wielder,
      forged: req.body.forged,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(WeaponsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        description: req.body.description,
        creator: req.body.creator,
        wielder: req.body.wielder,
        forged: req.body.forged,
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
      message: 'Weapon created.',
      data: {
        id: 1,
        name: fakeWeapon.name,
        description: fakeWeapon.description,
        creator: fakeWeapon.creator,
        wielder: fakeWeapon.wielder,
        forged: fakeWeapon.forged,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the weapon', async () => {
    const fakeWeapon = generateMockWeapon();
    const req = getMockReq({
      body: {
        name: fakeWeapon.name,
        description: fakeWeapon.description,
        creator: fakeWeapon.creator,
        wielder: fakeWeapon.wielder,
        forged: fakeWeapon.forged,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createWeapon(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateWeaponReqBody,
        CreateWeaponReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(WeaponsRepository.create).not.toHaveBeenCalled();
    expect(WeaponsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A weapon must be created belonging to one of your series or books.',
    });
  });
});

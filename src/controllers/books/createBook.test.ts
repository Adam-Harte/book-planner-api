import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
import { getUsersRepository, UsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { createBook } from './createBook';

describe('createBook', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let fakeUser: any;
  let user: any;
  let fakeSeries: any;
  let series: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    UsersRepository.findOne = jest
      .fn()
      .mockImplementation((options: object) =>
        usersRepository.findOne(options)
      );
    SeriesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        seriesRepository.getByUserIdAndSeriesId(userId, seriesId)
      );
    BooksRepository.create = jest
      .fn()
      .mockImplementation((book: any) => booksRepository.create(book));
    BooksRepository.save = jest
      .fn()
      .mockImplementation((book: any) => booksRepository.save(book));
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
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('should create a new book belonging to the user', async () => {
    const fakeBook = generateMockBook(user);
    const req = getMockReq({
      body: {
        name: fakeBook.name,
        genre: fakeBook.genre,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createBook(req as Request, res as Response);

    expect(BooksRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      genre: req.body.genre,
      user,
    });
    expect(BooksRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        genre: req.body.genre,
        user,
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Book created.',
      data: {
        id: 1,
        name: fakeBook.name,
        genre: fakeBook.genre,
      },
    });
  });

  it('should create a new book belonging to a series and the user', async () => {
    const fakeBook = generateMockBook(user, series);
    const req = getMockReq({
      body: {
        name: fakeBook.name,
        genre: fakeBook.genre,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createBook(req as Request, res as Response);

    expect(BooksRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      genre: req.body.genre,
      user,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(BooksRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        genre: req.body.genre,
        user,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Book created.',
      data: {
        id: 1,
        name: fakeBook.name,
        genre: fakeBook.genre,
      },
    });
  });
});

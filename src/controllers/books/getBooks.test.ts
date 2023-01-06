import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { getBooks } from './getBooks';

describe('getBooks', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let seriesRepository: any;
  let usersRepository: any;
  let fakeUser: any;
  let user: any;
  let fakeSeries: any;
  let series: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    booksRepository = getBooksRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    usersRepository = getUsersRepository(testDataSource);
    BooksRepository.getAllByUserId = jest
      .fn()
      .mockImplementation((userId: number) =>
        booksRepository.getAllByUserId(userId)
      );
    BooksRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        booksRepository.getAllByUserIdAndSeriesId(userId, seriesId)
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
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('should get all books belonging to the user', async () => {
    const fakeBook1 = generateMockBook(user, series);
    const fakeBook2 = generateMockBook(user, series);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getBooks(req as Request, res as Response);

    expect(BooksRepository.getAllByUserId).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Books by user id fetched.',
      data: [
        {
          id: book1.id,
          name: book1.name,
          genre: book1.genre,
        },
        {
          id: book2.id,
          name: book2.name,
          genre: book2.genre,
        },
      ],
    });
  });

  it('should get all books belonging to the user and a specified series', async () => {
    const fakeBook1 = generateMockBook(user);
    const fakeBook2 = generateMockBook(user, series);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getBooks(req as Request, res as Response);

    expect(BooksRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Books by user id and series id fetched.',
      data: [
        {
          id: book2.id,
          name: book2.name,
          genre: book2.genre,
        },
      ],
    });
  });
});

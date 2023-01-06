import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { getBookById, GetBookByIdReqParams } from './getBookById';

describe('getBookById', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let usersRepository: any;
  let fakeUser: any;
  let user: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    booksRepository = getBooksRepository(testDataSource);
    usersRepository = getUsersRepository(testDataSource);
    BooksRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        booksRepository.getByUserIdAndBookId(userId, bookId)
      );
    dbBackup = testDb.backup();
  });

  beforeEach(async () => {
    dbBackup.restore();
    fakeUser = generateMockUser();
    user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('should fail if the book does not belong to the user', async () => {
    const fakeBook1 = generateMockBook(user);
    const fakeBook2 = generateMockBook(user);

    const series1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(series1);

    const series2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(series2);

    const req = getMockReq({
      params: {
        bookId: '1',
      },
      userId: '2',
    });
    const { res } = getMockRes();

    await getBookById(
      req as unknown as Request<
        GetBookByIdReqParams,
        unknown,
        unknown,
        unknown,
        Record<string, any>
      >,
      res as Response
    );

    expect(BooksRepository.getByUserIdAndBookId).toHaveBeenCalledWith(2, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should get one book by a specific id', async () => {
    const fakeBook1 = generateMockBook(user);
    const fakeBook2 = generateMockBook(user);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const req = getMockReq({
      params: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getBookById(
      req as unknown as Request<
        GetBookByIdReqParams,
        unknown,
        unknown,
        unknown,
        Record<string, any>
      >,
      res as Response
    );

    expect(BooksRepository.getByUserIdAndBookId).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Book by id fetched.',
      data: {
        id: 1,
        name: fakeBook1.name,
        genre: fakeBook1.genre,
      },
    });
  });
});

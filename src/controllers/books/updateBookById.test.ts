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
import {
  updateBookById,
  updateBookReqBody,
  updateBookReqParams,
} from './updateBookById';

describe('updateBookById', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let booksRepository: any;
  let fakeUser: any;
  let user: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    BooksRepository.save = jest
      .fn()
      .mockImplementation((book: any) => booksRepository.save(book));
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

  it('should fail if the updated book does not belong to the user', async () => {
    const fakeBook1 = generateMockBook(user);
    const fakeBook2 = generateMockBook(user);
    const updatedFakeBook = generateMockBook();

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const req = getMockReq({
      params: {
        bookId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeBook,
        },
      },
      userId: '2',
    });
    const { res } = getMockRes();

    await updateBookById(
      req as unknown as Request<
        updateBookReqParams,
        unknown,
        updateBookReqBody,
        Record<string, any> | undefined,
        Record<string, any>
      >,
      res as Response
    );

    expect(BooksRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a book by a specific id', async () => {
    const fakeBook1 = generateMockBook(user);
    const fakeBook2 = generateMockBook(user);
    const updatedFakeBook = generateMockBook();

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const req = getMockReq({
      params: {
        bookId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeBook,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateBookById(
      req as unknown as Request<
        updateBookReqParams,
        unknown,
        updateBookReqBody,
        Record<string, any> | undefined,
        Record<string, any>
      >,
      res as Response
    );

    expect(BooksRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeBook)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Book updated.',
      data: {
        id: 1,
        name: updatedFakeBook.name,
        genre: updatedFakeBook.genre,
      },
    });
  });
});

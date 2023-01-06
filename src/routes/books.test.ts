import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository, UsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Books routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let user: any;
  let series: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
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
    BooksRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => booksRepository.delete(id));
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
    BooksRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        booksRepository.getByUserIdAndBookId(userId, bookId)
      );
    dbBackup = testDb.backup();
  });

  beforeEach(async () => {
    dbBackup.restore();
    user = await usersRepository.create({
      username: 'test',
      email: 'test@test.com',
      password: 'testUser123!',
    });
    await usersRepository.save(user);
    const fakeSeries = generateMockSeries(user);
    const createdSeries = await seriesRepository.create(fakeSeries);
    series = await seriesRepository.save(createdSeries);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
    server.close();
  });

  describe('GET /books', () => {
    it('gets all the books belonging to the user', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app)
        .get('/api/books')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
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

    it('gets all the books belonging to a series and the user when seriesId query param sent', async () => {
      const fakeBook1 = generateMockBook(user, series);
      const fakeBook2 = generateMockBook(user, series);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app)
        .get('/api/books?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Books by user id and series id fetched.',
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

    it('fails authorization if no access_token cookie', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app).get('/api/books');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /series', () => {
    it('fails validation when no name sent', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);

      const response = await request(app)
        .post('/api/books')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          genre: fakeBook2.genre,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'name field is required.',
            param: 'name',
          },
        ],
      });
    });

    it('creates a new book when /books route is passed correct data', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);

      const response = await request(app)
        .post('/api/books')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          name: fakeBook2.name,
          genre: fakeBook2.genre,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Book created.',
        data: {
          id: 2,
          name: fakeBook2.name,
          genre: fakeBook2.genre,
        },
      });
    });

    it('creates a new book related to a series when /books route is passed correct data and seriesId query param', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);

      const response = await request(app)
        .post('/api/books?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          name: fakeBook2.name,
          genre: fakeBook2.genre,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Book created.',
        data: {
          id: 2,
          name: fakeBook2.name,
          genre: fakeBook2.genre,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);

      const response = await request(app)
        .post('/api/books')
        .send({ name: fakeBook2.name, genre: fakeBook2.genre });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /books:bookId', () => {
    it('gets a book belonging to the user', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app)
        .get('/api/books/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Book by id fetched.',
        data: expect.objectContaining({
          id: book1.id,
          name: book1.name,
          genre: book1.genre,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app).get('/api/books/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /books:bookId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app)
        .patch('/api/books/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'updatedData field is required with data.',
            param: 'updatedData',
          },
        ],
      });
    });

    it('updates a book belonging to the user', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const updatedFakeBook = generateMockBook();
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app)
        .patch('/api/books/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeBook,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Book updated.',
        data: expect.objectContaining({
          id: book1.id,
          name: updatedFakeBook.name,
          genre: updatedFakeBook.genre,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app).patch('/api/books/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /books:bookId', () => {
    it('deletes a book belonging to the user', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app)
        .delete('/api/books/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Book deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeBook1 = generateMockBook(user);
      const fakeBook2 = generateMockBook(user);
      const book1 = await booksRepository.create(fakeBook1);
      await booksRepository.save(book1);
      const book2 = await booksRepository.create(fakeBook2);
      await booksRepository.save(book2);

      const response = await request(app).delete('/api/books/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

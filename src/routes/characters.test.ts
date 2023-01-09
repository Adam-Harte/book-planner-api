import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockCharacter } from '../mockData/characters';
import { generateMockSeries } from '../mockData/series';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import {
  CharactersRepository,
  getCharactersRepository,
} from '../repositories/characters';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Characters routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let charactersRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    charactersRepository = getCharactersRepository(testDataSource);
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
    CharactersRepository.create = jest
      .fn()
      .mockImplementation((character: any) =>
        charactersRepository.create(character)
      );
    CharactersRepository.save = jest
      .fn()
      .mockImplementation((character: any) =>
        charactersRepository.save(character)
      );
    CharactersRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => charactersRepository.delete(id));
    CharactersRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        charactersRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    CharactersRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        charactersRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    CharactersRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (characterId: number, userId: number, seriesId: number) =>
          charactersRepository.getByUserIdAndSeriesId(
            characterId,
            userId,
            seriesId
          )
      );
    CharactersRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (characterId: number, userId: number, bookId: number) =>
          charactersRepository.getByUserIdAndBookId(characterId, userId, bookId)
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
    const fakeBook = generateMockBook(user);
    const createdBook = await booksRepository.create(fakeBook);
    book = await booksRepository.save(createdBook);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
    server.close();
  });

  describe('GET /characters', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const fakeCharacter2 = generateMockCharacter(series, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);
      const character2 = await charactersRepository.create(fakeCharacter2);
      await charactersRepository.save(character2);

      const response = await request(app)
        .get('/api/characters')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the characters belonging to the user and a series', async () => {
      const fakeCharacter1 = generateMockCharacter(series);
      const fakeCharacter2 = generateMockCharacter(series);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);
      const character2 = await charactersRepository.create(fakeCharacter2);
      await charactersRepository.save(character2);

      const response = await request(app)
        .get('/api/characters?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Characters by user id and series id fetched.',
        data: [
          {
            id: character1.id,
            firstName: character1.firstName,
            type: character1.type,
          },
          {
            id: character2.id,
            firstName: character2.firstName,
            type: character2.type,
          },
        ],
      });
    });

    it('gets all the characters belonging to the user and a book', async () => {
      const fakeCharacter1 = generateMockCharacter({}, [book]);
      const fakeCharacter2 = generateMockCharacter({}, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);
      const character2 = await charactersRepository.create(fakeCharacter2);
      await charactersRepository.save(character2);

      const response = await request(app)
        .get('/api/characters?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Characters by user id and book id fetched.',
        data: [
          {
            id: character1.id,
            firstName: character1.firstName,
            type: character1.type,
          },
          {
            id: character2.id,
            firstName: character2.firstName,
            type: character2.type,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const fakeCharacter2 = generateMockCharacter(series, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);
      const character2 = await charactersRepository.create(fakeCharacter2);
      await charactersRepository.save(character2);

      const response = await request(app).get(
        '/api/characters?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /characters', () => {
    it('fails validation when no firstName sent', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .post('/api/characters')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          type: character1.type,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'firstName field is required.',
            param: 'firstName',
          },
        ],
      });
    });

    it('fails if neither seriesId or bookId query param are passed', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const fakeCharacter2 = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .post('/api/characters')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeCharacter2,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const fakeCharacter2 = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .post('/api/characters?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeCharacter2,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A character must be created belonging to one of your series or books.',
      });
    });

    it('creates a new character related to a series when /characters route is passed correct data and seriesId query param', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const fakeCharacter2 = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .post('/api/characters?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeCharacter2,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Character created.',
        data: {
          id: 2,
          firstName: fakeCharacter2.firstName,
          type: fakeCharacter2.type,
        },
      });
    });

    it('creates a new character related to a book when /characters route is passed correct data and bookId query param', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const fakeCharacter2 = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .post('/api/characters?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeCharacter2,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Character created.',
        data: {
          id: 2,
          firstName: fakeCharacter2.firstName,
          type: fakeCharacter2.type,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const fakeCharacter2 = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .post('/api/characters?seriesId=1')
        .send({ ...fakeCharacter2 });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /characters:characterId', () => {
    it('gets a character belonging to the user and series', async () => {
      const fakeCharacter1 = generateMockCharacter(series);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .get('/api/characters/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Character by id and series id fetched.',
        data: expect.objectContaining({
          id: character1.id,
          firstName: character1.firstName,
          type: character1.type,
        }),
      });
    });

    it('fails if a character is not found belonging to a series', async () => {
      const fakeCharacter1 = generateMockCharacter(series);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .get('/api/characters/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a character belonging to the user and book', async () => {
      const fakeCharacter1 = generateMockCharacter({}, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .get('/api/characters/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Character by id and book id fetched.',
        data: expect.objectContaining({
          id: character1.id,
          firstName: character1.firstName,
          type: character1.type,
        }),
      });
    });

    it('fails if a character is not found belonging to a book', async () => {
      const fakeCharacter1 = generateMockCharacter({}, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .get('/api/characters/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .get('/api/characters/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
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

  describe('PATCH /characters:characterId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const fakeCharacter2 = generateMockCharacter(series, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);
      const character2 = await charactersRepository.create(fakeCharacter2);
      await charactersRepository.save(character2);

      const response = await request(app)
        .patch('/api/characters/1')
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

    it('fails if neither seriesId or bookId query params are passed', async () => {
      const fakeCharacter1 = generateMockCharacter(series);
      const updatedFakeCharacter = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .patch('/api/characters/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeCharacter,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a character belonging to a series or book cant be found', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const updatedFakeCharacter = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .patch('/api/characters/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeCharacter,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a character belonging to the user and a series', async () => {
      const fakeCharacter1 = generateMockCharacter(series);
      const updatedFakeCharacter = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .patch('/api/characters/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeCharacter,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Character updated.',
        data: expect.objectContaining({
          id: character1.id,
          firstName: updatedFakeCharacter.firstName,
          type: updatedFakeCharacter.type,
        }),
      });
    });

    it('updates a character belonging to the user and a book', async () => {
      const fakeCharacter1 = generateMockCharacter({}, [book]);
      const updatedFakeCharacter = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .patch('/api/characters/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeCharacter,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Character updated.',
        data: expect.objectContaining({
          id: character1.id,
          firstName: updatedFakeCharacter.firstName,
          type: updatedFakeCharacter.type,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeCharacter1 = generateMockCharacter({}, [book]);
      const updatedFakeCharacter = generateMockCharacter();
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .patch('/api/characters/1')
        .send({
          updatedData: {
            ...updatedFakeCharacter,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /characters:characterId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .delete('/api/characters/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book by the user is found.', async () => {
      const fakeCharacter1 = generateMockCharacter(series, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .delete('/api/characters/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a character belonging to the user and a series', async () => {
      const fakeCharacter1 = generateMockCharacter(series);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .delete('/api/characters/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Character deleted.',
      });
    });

    it('deletes a character belonging to the user and a book', async () => {
      const fakeCharacter1 = generateMockCharacter({}, [book]);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app)
        .delete('/api/characters/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Character deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeCharacter1 = generateMockCharacter(series);
      const character1 = await charactersRepository.create(fakeCharacter1);
      await charactersRepository.save(character1);

      const response = await request(app).delete(
        '/api/characters/1?seriesId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

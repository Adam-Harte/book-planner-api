import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockTechnology } from '../mockData/technologies';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import {
  getTechnologiesRepository,
  TechnologiesRepository,
} from '../repositories/technologies';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Technologies routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let technologiesRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    technologiesRepository = getTechnologiesRepository(testDataSource);
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
    TechnologiesRepository.create = jest
      .fn()
      .mockImplementation((technology: any) =>
        technologiesRepository.create(technology)
      );
    TechnologiesRepository.save = jest
      .fn()
      .mockImplementation((technology: any) =>
        technologiesRepository.save(technology)
      );
    TechnologiesRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => technologiesRepository.delete(id));
    TechnologiesRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        technologiesRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    TechnologiesRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        technologiesRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    TechnologiesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (technologyId: number, userId: number, seriesId: number) =>
          technologiesRepository.getByUserIdAndSeriesId(
            technologyId,
            userId,
            seriesId
          )
      );
    TechnologiesRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (technologyId: number, userId: number, bookId: number) =>
          technologiesRepository.getByUserIdAndBookId(
            technologyId,
            userId,
            bookId
          )
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

  describe('GET /technologies', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeTechnology1 = generateMockTechnology(series, [book]);
      const fakeTechnology2 = generateMockTechnology(series, [book]);
      const technology1 = await technologiesRepository.create(fakeTechnology1);
      await technologiesRepository.save(technology1);
      const technology2 = await technologiesRepository.create(fakeTechnology2);
      await technologiesRepository.save(technology2);

      const response = await request(app)
        .get('/api/technologies')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the technologies belonging to the user and a series', async () => {
      const fakeTechnology1 = generateMockTechnology(series);
      const fakeTechnology2 = generateMockTechnology(series);
      const technology1 = await technologiesRepository.create(fakeTechnology1);
      await technologiesRepository.save(technology1);
      const technology2 = await technologiesRepository.create(fakeTechnology2);
      await technologiesRepository.save(technology2);

      const response = await request(app)
        .get('/api/technologies?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Technologies by user id and series id fetched.',
        data: [
          {
            id: technology1.id,
            name: technology1.name,
            description: technology1.description,
            inventor: technology1.inventor,
          },
          {
            id: technology2.id,
            name: technology2.name,
            description: technology2.description,
            inventor: technology2.inventor,
          },
        ],
      });
    });

    it('gets all the technologies belonging to the user and a book', async () => {
      const fakeTechnology1 = generateMockTechnology({}, [book]);
      const fakeTechnology2 = generateMockTechnology({}, [book]);
      const technology1 = await technologiesRepository.create(fakeTechnology1);
      await technologiesRepository.save(technology1);
      const technology2 = await technologiesRepository.create(fakeTechnology2);
      await technologiesRepository.save(technology2);

      const response = await request(app)
        .get('/api/technologies?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Technologies by user id and book id fetched.',
        data: [
          {
            id: technology1.id,
            name: technology1.name,
            description: technology1.description,
            inventor: technology1.inventor,
          },
          {
            id: technology2.id,
            name: technology2.name,
            description: technology2.description,
            inventor: technology2.inventor,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeTechnology1 = generateMockTechnology(series, [book]);
      const fakeTechnology2 = generateMockTechnology(series, [book]);
      const technology1 = await technologiesRepository.create(fakeTechnology1);
      await technologiesRepository.save(technology1);
      const technology2 = await technologiesRepository.create(fakeTechnology2);
      await technologiesRepository.save(technology2);

      const response = await request(app).get(
        '/api/technologies?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /technologies', () => {
    it('fails validation when no name sent', async () => {
      const fakeTechnology = generateMockTechnology();

      const response = await request(app)
        .post('/api/technologies')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          description: fakeTechnology.description,
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

    it('fails if neither seriesId or bookId query param are passed', async () => {
      const fakeTechnology = generateMockTechnology();

      const response = await request(app)
        .post('/api/technologies')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeTechnology,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeTechnology = generateMockTechnology();

      const response = await request(app)
        .post('/api/technologies?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeTechnology,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A technology must be created belonging to one of your series or books.',
      });
    });

    it('creates a new technology related to a series when /technologies route is passed correct data and seriesId query param', async () => {
      const fakeTechnology = generateMockTechnology();

      const response = await request(app)
        .post('/api/technologies?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeTechnology,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Technology created.',
        data: {
          id: 1,
          name: fakeTechnology.name,
          description: fakeTechnology.description,
          inventor: fakeTechnology.inventor,
        },
      });
    });

    it('creates a new technology related to a book when /technologies route is passed correct data and bookId query param', async () => {
      const fakeTechnology = generateMockTechnology();

      const response = await request(app)
        .post('/api/technologies?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeTechnology,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Technology created.',
        data: {
          id: 1,
          name: fakeTechnology.name,
          description: fakeTechnology.description,
          inventor: fakeTechnology.inventor,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeTechnology = generateMockTechnology();

      const response = await request(app)
        .post('/api/technologies?seriesId=1')
        .send({ ...fakeTechnology });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /technologies:technologyId', () => {
    it('gets a technology belonging to the user and series', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .get('/api/technologies/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Technology by id and series id fetched.',
        data: expect.objectContaining({
          id: technology.id,
          name: technology.name,
          description: technology.description,
          inventor: technology.inventor,
        }),
      });
    });

    it('fails if a technology is not found belonging to a series', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .get('/api/technologies/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a technology belonging to the user and book', async () => {
      const fakeTechnology = generateMockTechnology({}, [book]);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .get('/api/technologies/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Technology by id and book id fetched.',
        data: expect.objectContaining({
          id: technology.id,
          name: technology.name,
          description: technology.description,
          inventor: technology.inventor,
        }),
      });
    });

    it('fails if a technology is not found belonging to a book', async () => {
      const fakeTechnology = generateMockTechnology({}, [book]);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .get('/api/technologies/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .get('/api/technologies/1')
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
      const fakeTechnology = generateMockTechnology(series);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app).get('/api/technologies/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /technologies:technologyId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .patch('/api/technologies/1')
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
      const fakeTechnology = generateMockTechnology(series);
      const updatedFakeTechnology = generateMockTechnology();
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .patch('/api/technologies/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeTechnology,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a technology belonging to a series or book cant be found', async () => {
      const fakeTechnology = generateMockTechnology(series, [book]);
      const updatedFakeTechnology = generateMockTechnology();
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .patch('/api/technologies/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeTechnology,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a technology belonging to the user and a series', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const updatedFakeTechnology = generateMockTechnology();
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .patch('/api/technologies/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeTechnology,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Technology updated.',
        data: expect.objectContaining({
          id: technology.id,
          name: updatedFakeTechnology.name,
          description: updatedFakeTechnology.description,
          inventor: updatedFakeTechnology.inventor,
        }),
      });
    });

    it('updates a technology belonging to the user and a book', async () => {
      const fakeTechnology = generateMockTechnology({}, [book]);
      const updatedFakeTechnology = generateMockTechnology();
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .patch('/api/technologies/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeTechnology,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Technology updated.',
        data: expect.objectContaining({
          id: technology.id,
          name: updatedFakeTechnology.name,
          description: updatedFakeTechnology.description,
          inventor: updatedFakeTechnology.inventor,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const updatedFakeTechnology = generateMockTechnology();
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .patch('/api/technologies/1')
        .send({
          updatedData: {
            ...updatedFakeTechnology,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /technologies:technologyId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .delete('/api/technologies/1')
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
      const fakeTechnology = generateMockTechnology(series, [book]);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .delete('/api/technologies/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a technology belonging to the user and a series', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .delete('/api/technologies/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Technology deleted.',
      });
    });

    it('deletes a technology belonging to the user and a book', async () => {
      const fakeTechnology = generateMockTechnology({}, [book]);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app)
        .delete('/api/technologies/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Technology deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeTechnology = generateMockTechnology(series);
      const technology = await technologiesRepository.create(fakeTechnology);
      await technologiesRepository.save(technology);

      const response = await request(app).delete(
        '/api/technologies/1?seriesId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

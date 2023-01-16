import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockMagicSystem } from '../mockData/magicSystems';
import { generateMockSeries } from '../mockData/series';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import {
  getMagicSystemsRepository,
  MagicSystemsRepository,
} from '../repositories/magicSystems';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('MagicSystems routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let magicSystemsRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    magicSystemsRepository = getMagicSystemsRepository(testDataSource);
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
    MagicSystemsRepository.create = jest
      .fn()
      .mockImplementation((magicSystem: any) =>
        magicSystemsRepository.create(magicSystem)
      );
    MagicSystemsRepository.save = jest
      .fn()
      .mockImplementation((magicSystem: any) =>
        magicSystemsRepository.save(magicSystem)
      );
    MagicSystemsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => magicSystemsRepository.delete(id));
    MagicSystemsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        magicSystemsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    MagicSystemsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        magicSystemsRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    MagicSystemsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (magicSystemId: number, userId: number, seriesId: number) =>
          magicSystemsRepository.getByUserIdAndSeriesId(
            magicSystemId,
            userId,
            seriesId
          )
      );
    MagicSystemsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (magicSystemId: number, userId: number, bookId: number) =>
          magicSystemsRepository.getByUserIdAndBookId(
            magicSystemId,
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

  describe('GET /magic-systems', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeMagicSystem1 = generateMockMagicSystem(series, [book]);
      const fakeMagicSystem2 = generateMockMagicSystem(series, [book]);
      const magicSystem1 = await magicSystemsRepository.create(
        fakeMagicSystem1
      );
      await magicSystemsRepository.save(magicSystem1);
      const magicSystem2 = await magicSystemsRepository.create(
        fakeMagicSystem2
      );
      await magicSystemsRepository.save(magicSystem2);

      const response = await request(app)
        .get('/api/magic-systems')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the magic systems belonging to the user and a series', async () => {
      const fakeMagicSystem1 = generateMockMagicSystem(series);
      const fakeMagicSystem2 = generateMockMagicSystem(series);
      const magicSystem1 = await magicSystemsRepository.create(
        fakeMagicSystem1
      );
      await magicSystemsRepository.save(magicSystem1);
      const magicSystem2 = await magicSystemsRepository.create(
        fakeMagicSystem2
      );
      await magicSystemsRepository.save(magicSystem2);

      const response = await request(app)
        .get('/api/magic-systems?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Magic Systems by user id and series id fetched.',
        data: [
          {
            id: magicSystem1.id,
            name: magicSystem1.name,
            description: magicSystem1.description,
            rules: magicSystem1.rules,
          },
          {
            id: magicSystem2.id,
            name: magicSystem2.name,
            description: magicSystem2.description,
            rules: magicSystem2.rules,
          },
        ],
      });
    });

    it('gets all the magic systems belonging to the user and a book', async () => {
      const fakeMagicSystem1 = generateMockMagicSystem({}, [book]);
      const fakeMagicSystem2 = generateMockMagicSystem({}, [book]);
      const magicSystem1 = await magicSystemsRepository.create(
        fakeMagicSystem1
      );
      await magicSystemsRepository.save(magicSystem1);
      const magicSystem2 = await magicSystemsRepository.create(
        fakeMagicSystem2
      );
      await magicSystemsRepository.save(magicSystem2);

      const response = await request(app)
        .get('/api/magic-systems?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Magic Systems by user id and book id fetched.',
        data: [
          {
            id: magicSystem1.id,
            name: magicSystem1.name,
            description: magicSystem1.description,
            rules: magicSystem1.rules,
          },
          {
            id: magicSystem2.id,
            name: magicSystem2.name,
            description: magicSystem2.description,
            rules: magicSystem2.rules,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeMagicSystem1 = generateMockMagicSystem(series, [book]);
      const fakeMagicSystem2 = generateMockMagicSystem(series, [book]);
      const magicSystem1 = await magicSystemsRepository.create(
        fakeMagicSystem1
      );
      await magicSystemsRepository.save(magicSystem1);
      const magicSystem2 = await magicSystemsRepository.create(
        fakeMagicSystem2
      );
      await magicSystemsRepository.save(magicSystem2);

      const response = await request(app).get(
        '/api/plot-references?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /magic-systems', () => {
    it('fails validation when no name sent', async () => {
      const fakeMagicSystem = generateMockMagicSystem();

      const response = await request(app)
        .post('/api/magic-systems')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          description: fakeMagicSystem.description,
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
      const fakeMagicSystem = generateMockMagicSystem();

      const response = await request(app)
        .post('/api/magic-systems')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeMagicSystem,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeMagicSystem = generateMockMagicSystem();

      const response = await request(app)
        .post('/api/magic-systems?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeMagicSystem,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A magic system must be created belonging to one of your series or books.',
      });
    });

    it('creates a new magic system related to a series when /magic-systems route is passed correct data and seriesId query param', async () => {
      const fakeMagicSystem = generateMockMagicSystem();

      const response = await request(app)
        .post('/api/magic-systems?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeMagicSystem,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Magic System created.',
        data: {
          id: 1,
          name: fakeMagicSystem.name,
          description: fakeMagicSystem.description,
          rules: fakeMagicSystem.rules,
        },
      });
    });

    it('creates a new magic system related to a book when /magic-systems route is passed correct data and bookId query param', async () => {
      const fakeMagicSystem = generateMockMagicSystem();

      const response = await request(app)
        .post('/api/magic-systems?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeMagicSystem,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Magic System created.',
        data: {
          id: 1,
          name: fakeMagicSystem.name,
          description: fakeMagicSystem.description,
          rules: fakeMagicSystem.rules,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeMagicSystem = generateMockMagicSystem();

      const response = await request(app)
        .post('/api/magic-systems?seriesId=1')
        .send({ ...fakeMagicSystem });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /magic-systems:magicSystemId', () => {
    it('gets a magic system belonging to the user and series', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .get('/api/magic-systems/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Magic System by id and series id fetched.',
        data: expect.objectContaining({
          id: magicSystem.id,
          name: magicSystem.name,
          description: magicSystem.description,
          rules: magicSystem.rules,
        }),
      });
    });

    it('fails if a magic system is not found belonging to a series', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .get('/api/magic-systems/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a magic system belonging to the user and book', async () => {
      const fakeMagicSystem = generateMockMagicSystem({}, [book]);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .get('/api/magic-systems/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Magic System by id and book id fetched.',
        data: expect.objectContaining({
          id: magicSystem.id,
          name: magicSystem.name,
          description: magicSystem.description,
          rules: magicSystem.rules,
        }),
      });
    });

    it('fails if a magic system is not found belonging to a book', async () => {
      const fakeMagicSystem = generateMockMagicSystem({}, [book]);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .get('/api/magic-systems/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .get('/api/magic-systems/1')
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
      const fakeMagicSystem = generateMockMagicSystem(series);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app).get('/api/magic-systems/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /magic-systems:magicSystemId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .patch('/api/magic-systems/1')
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
      const fakeMagicSystem = generateMockMagicSystem(series);
      const updatedFakeMagicSystem = generateMockMagicSystem();
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .patch('/api/magic-systems/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeMagicSystem,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a magic system belonging to a series or book cant be found', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series, [book]);
      const updatedFakeMagicSystem = generateMockMagicSystem();
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .patch('/api/magic-systems/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeMagicSystem,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a magic system belonging to the user and a series', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series);
      const updatedFakeMagicSystem = generateMockMagicSystem();
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .patch('/api/magic-systems/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeMagicSystem,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Magic System updated.',
        data: expect.objectContaining({
          id: magicSystem.id,
          name: updatedFakeMagicSystem.name,
          description: updatedFakeMagicSystem.description,
          rules: updatedFakeMagicSystem.rules,
        }),
      });
    });

    it('updates a magic system belonging to the user and a book', async () => {
      const fakeMagicSystem = generateMockMagicSystem({}, [book]);
      const updatedFakeMagicSystem = generateMockMagicSystem();
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .patch('/api/magic-systems/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeMagicSystem,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Magic System updated.',
        data: expect.objectContaining({
          id: magicSystem.id,
          name: updatedFakeMagicSystem.name,
          description: updatedFakeMagicSystem.description,
          rules: updatedFakeMagicSystem.rules,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series);
      const updatedFakeMagicSystem = generateMockMagicSystem();
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .patch('/api/magic-systems/1')
        .send({
          updatedData: {
            ...updatedFakeMagicSystem,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /magic-systems:magicSystemId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series, [book]);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .delete('/api/magic-systems/1')
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
      const fakeMagicSystem = generateMockMagicSystem(series, [book]);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .delete('/api/magic-systems/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a magic system belonging to the user and a series', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .delete('/api/magic-systems/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Magic System deleted.',
      });
    });

    it('deletes a magic system belonging to the user and a book', async () => {
      const fakeMagicSystem = generateMockMagicSystem({}, [book]);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app)
        .delete('/api/magic-systems/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Magic System deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeMagicSystem = generateMockMagicSystem(series, [book]);
      const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
      await magicSystemsRepository.save(magicSystem);

      const response = await request(app).delete(
        '/api/magic-systems/1?seriesId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

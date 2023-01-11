import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockWorld } from '../mockData/worlds';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository } from '../repositories/users';
import { getWorldsRepository, WorldsRepository } from '../repositories/worlds';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Worlds routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let worldsRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    worldsRepository = getWorldsRepository(testDataSource);
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
    WorldsRepository.create = jest
      .fn()
      .mockImplementation((world: any) => worldsRepository.create(world));
    WorldsRepository.save = jest
      .fn()
      .mockImplementation((world: any) => worldsRepository.save(world));
    WorldsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => worldsRepository.delete(id));
    WorldsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        worldsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    WorldsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        worldsRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    WorldsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((worldId: number, userId: number, seriesId: number) =>
        worldsRepository.getByUserIdAndSeriesId(worldId, userId, seriesId)
      );
    WorldsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((worldId: number, userId: number, bookId: number) =>
        worldsRepository.getByUserIdAndBookId(worldId, userId, bookId)
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

  describe('GET /worlds', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeWorld1 = generateMockWorld(series, [book]);
      const fakeWorld2 = generateMockWorld(series, [book]);
      const world1 = await worldsRepository.create(fakeWorld1);
      await worldsRepository.save(world1);
      const world2 = await worldsRepository.create(fakeWorld2);
      await worldsRepository.save(world2);

      const response = await request(app)
        .get('/api/worlds')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the worlds belonging to the user and a series', async () => {
      const fakeWorld1 = generateMockWorld(series);
      const fakeWorld2 = generateMockWorld(series);
      const world1 = await worldsRepository.create(fakeWorld1);
      await worldsRepository.save(world1);
      const world2 = await worldsRepository.create(fakeWorld2);
      await worldsRepository.save(world2);

      const response = await request(app)
        .get('/api/worlds?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Worlds by user id and series id fetched.',
        data: [
          {
            id: world1.id,
            name: world1.name,
            description: world1.description,
          },
          {
            id: world2.id,
            name: world2.name,
            description: world2.description,
          },
        ],
      });
    });

    it('gets all the worlds belonging to the user and a book', async () => {
      const fakeWorld1 = generateMockWorld({}, [book]);
      const fakeWorld2 = generateMockWorld({}, [book]);
      const world1 = await worldsRepository.create(fakeWorld1);
      await worldsRepository.save(world1);
      const world2 = await worldsRepository.create(fakeWorld2);
      await worldsRepository.save(world2);
      const response = await request(app)
        .get('/api/worlds?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Worlds by user id and book id fetched.',
        data: [
          {
            id: world1.id,
            name: world1.name,
            description: world1.description,
          },
          {
            id: world2.id,
            name: world2.name,
            description: world2.description,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeWorld1 = generateMockWorld(series, [book]);
      const fakeWorld2 = generateMockWorld(series, [book]);
      const world1 = await worldsRepository.create(fakeWorld1);
      await worldsRepository.save(world1);
      const world2 = await worldsRepository.create(fakeWorld2);
      await worldsRepository.save(world2);

      const response = await request(app).get(
        '/api/worlds?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /worlds', () => {
    it('fails validation when no name sent', async () => {
      const fakeWorld = generateMockWorld();

      const response = await request(app)
        .post('/api/worlds')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          description: fakeWorld.description,
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
      const fakeWorld = generateMockWorld();

      const response = await request(app)
        .post('/api/worlds')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeWorld,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeWorld = generateMockWorld();

      const response = await request(app)
        .post('/api/worlds?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeWorld,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A world must be created belonging to one of your series or books.',
      });
    });

    it('creates a new world related to a series when /worlds route is passed correct data and seriesId query param', async () => {
      const fakeWorld = generateMockWorld();

      const response = await request(app)
        .post('/api/worlds?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeWorld,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'World created.',
        data: {
          id: 1,
          name: fakeWorld.name,
          description: fakeWorld.description,
        },
      });
    });

    it('creates a new world related to a book when /worlds route is passed correct data and bookId query param', async () => {
      const fakeWorld = generateMockWorld();

      const response = await request(app)
        .post('/api/worlds?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeWorld,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'World created.',
        data: {
          id: 1,
          name: fakeWorld.name,
          description: fakeWorld.description,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeWorld = generateMockWorld();

      const response = await request(app)
        .post('/api/worlds?seriesId=1')
        .send({ ...fakeWorld });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /worlds:worldId', () => {
    it('gets a world belonging to the user and series', async () => {
      const fakeWorld = generateMockWorld(series);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .get('/api/worlds/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'World by id and series id fetched.',
        data: expect.objectContaining({
          id: world.id,
          name: world.name,
          description: world.description,
        }),
      });
    });

    it('fails if a world is not found belonging to a series', async () => {
      const fakeWorld = generateMockWorld(series);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .get('/api/worlds/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a world belonging to the user and book', async () => {
      const fakeWorld = generateMockWorld({}, [book]);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .get('/api/worlds/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'World by id and book id fetched.',
        data: expect.objectContaining({
          id: world.id,
          name: world.name,
          description: world.description,
        }),
      });
    });

    it('fails if a world is not found belonging to a book', async () => {
      const fakeWorld = generateMockWorld({}, [book]);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .get('/api/worlds/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeWorld = generateMockWorld(series);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .get('/api/worlds/1')
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
      const fakeWorld = generateMockWorld(series);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app).get('/api/worlds/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /worlds:worldId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeWorld = generateMockWorld(series);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .patch('/api/worlds/1')
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
      const fakeWorld = generateMockWorld(series);
      const updatedFakeWorld = generateMockWorld();
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .patch('/api/worlds/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeWorld,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a world belonging to a series or book cant be found', async () => {
      const fakeWorld = generateMockWorld(series, [book]);
      const updatedFakeWorld = generateMockWorld();
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .patch('/api/worlds/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeWorld,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a world belonging to the user and a series', async () => {
      const fakeWorld = generateMockWorld(series);
      const updatedFakeWorld = generateMockWorld();
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .patch('/api/worlds/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeWorld,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'World updated.',
        data: expect.objectContaining({
          id: world.id,
          name: updatedFakeWorld.name,
          description: updatedFakeWorld.description,
        }),
      });
    });

    it('updates a world belonging to the user and a book', async () => {
      const fakeWorld = generateMockWorld({}, [book]);
      const updatedFakeWorld = generateMockWorld();
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .patch('/api/worlds/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeWorld,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'World updated.',
        data: expect.objectContaining({
          id: world.id,
          name: updatedFakeWorld.name,
          description: updatedFakeWorld.description,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeWorld = generateMockWorld(series);
      const updatedFakeWorld = generateMockWorld();
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .patch('/api/worlds/1')
        .send({
          updatedData: {
            ...updatedFakeWorld,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /worlds:worldId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeWorld = generateMockWorld(series, [book]);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .delete('/api/worlds/1')
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
      const fakeWorld = generateMockWorld(series, [book]);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .delete('/api/worlds/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a world belonging to the user and a series', async () => {
      const fakeWorld = generateMockWorld(series);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .delete('/api/worlds/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'World deleted.',
      });
    });

    it('deletes a world belonging to the user and a book', async () => {
      const fakeWorld = generateMockWorld({}, [book]);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app)
        .delete('/api/worlds/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'World deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeWorld = generateMockWorld(series);
      const world = await worldsRepository.create(fakeWorld);
      await worldsRepository.save(world);

      const response = await request(app).delete('/api/worlds/1?seriesId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

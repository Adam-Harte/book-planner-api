import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBattle } from '../mockData/battles';
import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import {
  BattlesRepository,
  getBattlesRepository,
} from '../repositories/battles';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Battles routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let battlesRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    battlesRepository = getBattlesRepository(testDataSource);
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
    BattlesRepository.create = jest
      .fn()
      .mockImplementation((battle: any) => battlesRepository.create(battle));
    BattlesRepository.save = jest
      .fn()
      .mockImplementation((battle: any) => battlesRepository.save(battle));
    BattlesRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => battlesRepository.delete(id));
    BattlesRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        battlesRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    BattlesRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        battlesRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    BattlesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (battleId: number, userId: number, seriesId: number) =>
          battlesRepository.getByUserIdAndSeriesId(battleId, userId, seriesId)
      );
    BattlesRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((battleId: number, userId: number, bookId: number) =>
        battlesRepository.getByUserIdAndBookId(battleId, userId, bookId)
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

  describe('GET /battles', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeBattle1 = generateMockBattle(series, [book]);
      const fakeBattle2 = generateMockBattle(series, [book]);
      const battle1 = await battlesRepository.create(fakeBattle1);
      await battlesRepository.save(battle1);
      const battle2 = await battlesRepository.create(fakeBattle2);
      await battlesRepository.save(battle2);

      const response = await request(app)
        .get('/api/battles')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the battles belonging to the user and a series', async () => {
      const fakeBattle1 = generateMockBattle(series);
      const fakeBattle2 = generateMockBattle(series);
      const battle1 = await battlesRepository.create(fakeBattle1);
      await battlesRepository.save(battle1);
      const battle2 = await battlesRepository.create(fakeBattle2);
      await battlesRepository.save(battle2);

      const response = await request(app)
        .get('/api/battles?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Battles by user id and series id fetched.',
        data: [
          {
            id: battle1.id,
            name: battle1.name,
            start: battle1.start,
            end: battle1.end,
            description: battle1.description,
          },
          {
            id: battle2.id,
            name: battle2.name,
            start: battle2.start,
            end: battle2.end,
            description: battle2.description,
          },
        ],
      });
    });

    it('gets all the battles belonging to the user and a book', async () => {
      const fakeBattle1 = generateMockBattle({}, [book]);
      const fakeBattle2 = generateMockBattle({}, [book]);
      const battle1 = await battlesRepository.create(fakeBattle1);
      await battlesRepository.save(battle1);
      const battle2 = await battlesRepository.create(fakeBattle2);
      await battlesRepository.save(battle2);

      const response = await request(app)
        .get('/api/battles?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Battles by user id and book id fetched.',
        data: [
          {
            id: battle1.id,
            name: battle1.name,
            start: battle1.start,
            end: battle1.end,
            description: battle1.description,
          },
          {
            id: battle2.id,
            name: battle2.name,
            start: battle2.start,
            end: battle2.end,
            description: battle2.description,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeBattle1 = generateMockBattle(series, [book]);
      const fakeBattle2 = generateMockBattle(series, [book]);
      const battle1 = await battlesRepository.create(fakeBattle1);
      await battlesRepository.save(battle1);
      const battle2 = await battlesRepository.create(fakeBattle2);
      await battlesRepository.save(battle2);

      const response = await request(app).get(
        '/api/battles?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /battles', () => {
    it('fails validation when no name sent', async () => {
      const fakeBattle = generateMockBattle();

      const response = await request(app)
        .post('/api/battles')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          description: fakeBattle.description,
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
      const fakeBattle = generateMockBattle();

      const response = await request(app)
        .post('/api/battles')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeBattle,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeBattle = generateMockBattle();

      const response = await request(app)
        .post('/api/battles?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeBattle,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A battle must be created belonging to one of your series or books.',
      });
    });

    it('creates a new battle related to a series when /battles route is passed correct data and seriesId query param', async () => {
      const fakeBattle = generateMockBattle();

      const response = await request(app)
        .post('/api/battles?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeBattle,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Battle created.',
        data: {
          id: 1,
          name: fakeBattle.name,
          start: fakeBattle.start,
          end: fakeBattle.end,
          description: fakeBattle.description,
        },
      });
    });

    it('creates a new battle related to a book when /battles route is passed correct data and bookId query param', async () => {
      const fakeBattle = generateMockBattle();

      const response = await request(app)
        .post('/api/battles?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeBattle,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Battle created.',
        data: {
          id: 1,
          name: fakeBattle.name,
          start: fakeBattle.start,
          end: fakeBattle.end,
          description: fakeBattle.description,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeBattle = generateMockBattle();

      const response = await request(app)
        .post('/api/battles?seriesId=1')
        .send({ ...fakeBattle });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /battles:battleId', () => {
    it('gets a battle belonging to the user and series', async () => {
      const fakeBattle = generateMockBattle(series);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .get('/api/battles/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Battle by id and series id fetched.',
        data: expect.objectContaining({
          id: battle.id,
          name: battle.name,
          start: battle.start,
          end: battle.end,
          description: battle.description,
        }),
      });
    });

    it('fails if a battle is not found belonging to a series', async () => {
      const fakeBattle = generateMockBattle(series);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .get('/api/battles/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a battle belonging to the user and book', async () => {
      const fakeBattle = generateMockBattle({}, [book]);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .get('/api/battles/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Battle by id and book id fetched.',
        data: expect.objectContaining({
          id: battle.id,
          name: battle.name,
          start: battle.start,
          end: battle.end,
          description: battle.description,
        }),
      });
    });

    it('fails if a battle is not found belonging to a book', async () => {
      const fakeBattle = generateMockBattle({}, [book]);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .get('/api/battles/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeBattle = generateMockBattle(series);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .get('/api/battles/1')
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
      const fakeBattle = generateMockBattle(series);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app).get('/api/battles/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /battles:battleId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeBattle = generateMockBattle(series);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .patch('/api/battles/1')
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
      const fakeBattle = generateMockBattle(series);
      const updatedFakeBattle = generateMockBattle();
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .patch('/api/battles/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeBattle,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a battle belonging to a series or book cant be found', async () => {
      const fakeBattle = generateMockBattle(series, [book]);
      const updatedFakeBattle = generateMockBattle();
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .patch('/api/battles/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeBattle,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a battle belonging to the user and a series', async () => {
      const fakeBattle = generateMockBattle(series);
      const updatedFakeBattle = generateMockBattle();
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .patch('/api/battles/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeBattle,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Battle updated.',
        data: expect.objectContaining({
          id: battle.id,
          name: updatedFakeBattle.name,
          start: updatedFakeBattle.start,
          end: updatedFakeBattle.end,
          description: updatedFakeBattle.description,
        }),
      });
    });

    it('updates a battle belonging to the user and a book', async () => {
      const fakeBattle = generateMockBattle({}, [book]);
      const updatedFakeBattle = generateMockBattle();
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .patch('/api/battles/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeBattle,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Battle updated.',
        data: expect.objectContaining({
          id: battle.id,
          name: updatedFakeBattle.name,
          start: updatedFakeBattle.start,
          end: updatedFakeBattle.end,
          description: updatedFakeBattle.description,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeBattle = generateMockBattle(series);
      const updatedFakeBattle = generateMockBattle();
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .patch('/api/battles/1')
        .send({
          updatedData: {
            ...updatedFakeBattle,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /battles:battleId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeBattle = generateMockBattle(series);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .delete('/api/battles/1')
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
      const fakeBattle = generateMockBattle(series, [book]);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .delete('/api/battles/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a battle belonging to the user and a series', async () => {
      const fakeBattle = generateMockBattle(series);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .delete('/api/battles/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Battle deleted.',
      });
    });

    it('deletes a battle belonging to the user and a book', async () => {
      const fakeBattle = generateMockBattle({}, [book]);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app)
        .delete('/api/battles/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Battle deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeBattle = generateMockBattle(series);
      const battle = await battlesRepository.create(fakeBattle);
      await battlesRepository.save(battle);

      const response = await request(app).delete('/api/battles/1?seriesId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

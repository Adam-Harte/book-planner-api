import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockCreature } from '../mockData/creatures';
import { generateMockSeries } from '../mockData/series';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import {
  CreaturesRepository,
  getCreaturesRepository,
} from '../repositories/creatures';
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
  let creaturesRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    creaturesRepository = getCreaturesRepository(testDataSource);
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
    CreaturesRepository.create = jest
      .fn()
      .mockImplementation((creature: any) =>
        creaturesRepository.create(creature)
      );
    CreaturesRepository.save = jest
      .fn()
      .mockImplementation((creature: any) =>
        creaturesRepository.save(creature)
      );
    CreaturesRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => creaturesRepository.delete(id));
    CreaturesRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        creaturesRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    CreaturesRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        creaturesRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    CreaturesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (creatureId: number, userId: number, seriesId: number) =>
          creaturesRepository.getByUserIdAndSeriesId(
            creatureId,
            userId,
            seriesId
          )
      );
    CreaturesRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (creatureId: number, userId: number, bookId: number) =>
          creaturesRepository.getByUserIdAndBookId(creatureId, userId, bookId)
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

  describe('GET /creatures', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const fakeCreature2 = generateMockCreature(series, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);
      const creature2 = await creaturesRepository.create(fakeCreature2);
      await creaturesRepository.save(creature2);

      const response = await request(app)
        .get('/api/creatures')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the creatures belonging to the user and a series', async () => {
      const fakeCreature1 = generateMockCreature(series);
      const fakeCreature2 = generateMockCreature(series);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);
      const creature2 = await creaturesRepository.create(fakeCreature2);
      await creaturesRepository.save(creature2);

      const response = await request(app)
        .get('/api/creatures?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Creatures by user id and series id fetched.',
        data: [
          {
            id: creature1.id,
            name: creature1.name,
            personalityDescription: creature1.personalityDescription,
            physicalDescription: creature1.physicalDescription,
          },
          {
            id: creature2.id,
            name: creature2.name,
            personalityDescription: creature2.personalityDescription,
            physicalDescription: creature2.physicalDescription,
          },
        ],
      });
    });

    it('gets all the creatures belonging to the user and a book', async () => {
      const fakeCreature1 = generateMockCreature({}, [book]);
      const fakeCreature2 = generateMockCreature({}, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);
      const creature2 = await creaturesRepository.create(fakeCreature2);
      await creaturesRepository.save(creature2);

      const response = await request(app)
        .get('/api/creatures?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Creatures by user id and book id fetched.',
        data: [
          {
            id: creature1.id,
            name: creature1.name,
            personalityDescription: creature1.personalityDescription,
            physicalDescription: creature1.physicalDescription,
          },
          {
            id: creature2.id,
            name: creature2.name,
            personalityDescription: creature2.personalityDescription,
            physicalDescription: creature2.physicalDescription,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const fakeCreature2 = generateMockCreature(series, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);
      const creature2 = await creaturesRepository.create(fakeCreature2);
      await creaturesRepository.save(creature2);

      const response = await request(app).get(
        '/api/creatures?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /creatures', () => {
    it('fails validation when no name sent', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .post('/api/creatures')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          personalityDescription: creature1.personalityDescription,
          physicalDescription: creature1.physicalDescription,
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
      const fakeCreature1 = generateMockCreature(series, [book]);
      const fakeCreature2 = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .post('/api/creatures')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeCreature2,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const fakeCreature2 = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .post('/api/creatures?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeCreature2,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A creature must be created belonging to one of your series or books.',
      });
    });

    it('creates a new creature related to a series when /creatures route is passed correct data and seriesId query param', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const fakeCreature2 = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .post('/api/creatures?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeCreature2,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Creature created.',
        data: {
          id: 2,
          name: fakeCreature2.name,
          personalityDescription: fakeCreature2.personalityDescription,
          physicalDescription: fakeCreature2.physicalDescription,
        },
      });
    });

    it('creates a new creature related to a book when /creatures route is passed correct data and bookId query param', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const fakeCreature2 = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .post('/api/creatures?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeCreature2,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Creature created.',
        data: {
          id: 2,
          name: fakeCreature2.name,
          personalityDescription: fakeCreature2.personalityDescription,
          physicalDescription: fakeCreature2.physicalDescription,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const fakeCreature2 = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .post('/api/creatures?seriesId=1')
        .send({
          ...fakeCreature2,
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /creatures:creatureId', () => {
    it('gets a creature belonging to the user and series', async () => {
      const fakecreature1 = generateMockCreature(series);
      const creature1 = await creaturesRepository.create(fakecreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .get('/api/creatures/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Creature by id and series id fetched.',
        data: expect.objectContaining({
          id: creature1.id,
          name: creature1.name,
          personalityDescription: creature1.personalityDescription,
          physicalDescription: creature1.physicalDescription,
        }),
      });
    });

    it('fails if a creature is not found belonging to a series', async () => {
      const fakecreature1 = generateMockCreature(series);
      const creature1 = await creaturesRepository.create(fakecreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .get('/api/creatures/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a character belonging to the user and book', async () => {
      const fakeCreature1 = generateMockCreature({}, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .get('/api/creatures/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Creature by id and book id fetched.',
        data: expect.objectContaining({
          id: creature1.id,
          name: creature1.name,
          personalityDescription: creature1.personalityDescription,
          physicalDescription: creature1.physicalDescription,
        }),
      });
    });

    it('fails if a character is not found belonging to a book', async () => {
      const fakecreature1 = generateMockCreature({}, [book]);
      const creature1 = await creaturesRepository.create(fakecreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .get('/api/creatures/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakecreature1 = generateMockCreature(series, [book]);
      const creature1 = await creaturesRepository.create(fakecreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .get('/api/creatures/1')
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
      const fakecreature1 = generateMockCreature(series);
      const creature1 = await creaturesRepository.create(fakecreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app).get('/api/creatures/1?seriesId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /creatures:creatureId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const fakeCreature2 = generateMockCreature(series, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);
      const creature2 = await creaturesRepository.create(fakeCreature2);
      await creaturesRepository.save(creature2);

      const response = await request(app)
        .patch('/api/creatures/1')
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
      const fakeCreature1 = generateMockCreature(series);
      const updatedFakeCreature = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .patch('/api/creatures/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeCreature,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a creature belonging to a series or book cant be found', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const updatedFakeCreature = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .patch('/api/creatures/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeCreature,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a creature belonging to the user and a series', async () => {
      const fakeCreature1 = generateMockCreature(series);
      const updatedFakeCreature = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .patch('/api/creatures/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeCreature,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Creature updated.',
        data: expect.objectContaining({
          id: creature1.id,
          name: updatedFakeCreature.name,
          personalityDescription: updatedFakeCreature.personalityDescription,
          physicalDescription: updatedFakeCreature.physicalDescription,
        }),
      });
    });

    it('updates a creature belonging to the user and a book', async () => {
      const fakeCreature1 = generateMockCreature({}, [book]);
      const updatedFakeCreature = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .patch('/api/creatures/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeCreature,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Creature updated.',
        data: expect.objectContaining({
          id: creature1.id,
          name: updatedFakeCreature.name,
          personalityDescription: updatedFakeCreature.personalityDescription,
          physicalDescription: updatedFakeCreature.physicalDescription,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeCreature1 = generateMockCreature({}, [book]);
      const updatedFakeCreature = generateMockCreature();
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .patch('/api/creatures/1')
        .send({
          updatedData: {
            ...updatedFakeCreature,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /creatures:creatureId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeCreature1 = generateMockCreature(series, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .delete('/api/creatures/1')
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
      const fakeCreature1 = generateMockCreature(series, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .delete('/api/creatures/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a creature belonging to the user and a series', async () => {
      const fakeCreature1 = generateMockCreature(series);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .delete('/api/creatures/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Creature deleted.',
      });
    });

    it('deletes a creature belonging to the user and a book', async () => {
      const fakeCreature1 = generateMockCreature({}, [book]);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app)
        .delete('/api/creatures/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Creature deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeCreature1 = generateMockCreature(series);
      const creature1 = await creaturesRepository.create(fakeCreature1);
      await creaturesRepository.save(creature1);

      const response = await request(app).delete('/api/creatures/1?seriesId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

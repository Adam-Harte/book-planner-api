import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockWeapon } from '../mockData/weapons';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository } from '../repositories/users';
import {
  getWeaponsRepository,
  WeaponsRepository,
} from '../repositories/weapons';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Weapons routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let weaponsRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    weaponsRepository = getWeaponsRepository(testDataSource);
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
    WeaponsRepository.create = jest
      .fn()
      .mockImplementation((weapon: any) => weaponsRepository.create(weapon));
    WeaponsRepository.save = jest
      .fn()
      .mockImplementation((weapon: any) => weaponsRepository.save(weapon));
    WeaponsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => weaponsRepository.delete(id));
    WeaponsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        weaponsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    WeaponsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        weaponsRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    WeaponsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (weaponId: number, userId: number, seriesId: number) =>
          weaponsRepository.getByUserIdAndSeriesId(weaponId, userId, seriesId)
      );
    WeaponsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((weaponId: number, userId: number, bookId: number) =>
        weaponsRepository.getByUserIdAndBookId(weaponId, userId, bookId)
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

  describe('GET /weapons', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeWeapon1 = generateMockWeapon(series, [book]);
      const fakeWeapon2 = generateMockWeapon(series, [book]);
      const weapon1 = await weaponsRepository.create(fakeWeapon1);
      await weaponsRepository.save(weapon1);
      const weapon2 = await weaponsRepository.create(fakeWeapon2);
      await weaponsRepository.save(weapon2);

      const response = await request(app)
        .get('/api/weapons')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the weapons belonging to the user and a series', async () => {
      const fakeWeapon1 = generateMockWeapon(series);
      const fakeWeapon2 = generateMockWeapon(series);
      const weapon1 = await weaponsRepository.create(fakeWeapon1);
      await weaponsRepository.save(weapon1);
      const weapon2 = await weaponsRepository.create(fakeWeapon2);
      await weaponsRepository.save(weapon2);

      const response = await request(app)
        .get('/api/weapons?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Weapons by user id and series id fetched.',
        data: [
          {
            id: weapon1.id,
            name: weapon1.name,
            description: weapon1.description,
            creator: weapon1.creator,
            wielder: weapon1.wielder,
            forged: weapon1.forged,
          },
          {
            id: weapon2.id,
            name: weapon2.name,
            description: weapon2.description,
            creator: weapon2.creator,
            wielder: weapon2.wielder,
            forged: weapon2.forged,
          },
        ],
      });
    });

    it('gets all the weapons belonging to the user and a book', async () => {
      const fakeWeapon1 = generateMockWeapon({}, [book]);
      const fakeWeapon2 = generateMockWeapon({}, [book]);
      const weapon1 = await weaponsRepository.create(fakeWeapon1);
      await weaponsRepository.save(weapon1);
      const weapon2 = await weaponsRepository.create(fakeWeapon2);
      await weaponsRepository.save(weapon2);

      const response = await request(app)
        .get('/api/weapons?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Weapons by user id and book id fetched.',
        data: [
          {
            id: weapon1.id,
            name: weapon1.name,
            description: weapon1.description,
            creator: weapon1.creator,
            wielder: weapon1.wielder,
            forged: weapon1.forged,
          },
          {
            id: weapon2.id,
            name: weapon2.name,
            description: weapon2.description,
            creator: weapon2.creator,
            wielder: weapon2.wielder,
            forged: weapon2.forged,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeWeapon1 = generateMockWeapon(series, [book]);
      const fakeWeapon2 = generateMockWeapon(series, [book]);
      const weapon1 = await weaponsRepository.create(fakeWeapon1);
      await weaponsRepository.save(weapon1);
      const weapon2 = await weaponsRepository.create(fakeWeapon2);
      await weaponsRepository.save(weapon2);

      const response = await request(app).get(
        '/api/weapons?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /weapons', () => {
    it('fails validation when no name sent', async () => {
      const fakeWeapon = generateMockWeapon();

      const response = await request(app)
        .post('/api/weapons')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          description: fakeWeapon.description,
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
      const fakeWeapon = generateMockWeapon();

      const response = await request(app)
        .post('/api/weapons')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeWeapon,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeWeapon = generateMockWeapon();

      const response = await request(app)
        .post('/api/weapons?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeWeapon,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A weapon must be created belonging to one of your series or books.',
      });
    });

    it('creates a new weapon related to a series when /weapons route is passed correct data and seriesId query param', async () => {
      const fakeWeapon = generateMockWeapon();

      const response = await request(app)
        .post('/api/weapons?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeWeapon,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Weapon created.',
        data: {
          id: 1,
          name: fakeWeapon.name,
          description: fakeWeapon.description,
          creator: fakeWeapon.creator,
          wielder: fakeWeapon.wielder,
          forged: fakeWeapon.forged,
        },
      });
    });

    it('creates a new weapon related to a book when /weapons route is passed correct data and bookId query param', async () => {
      const fakeWeapon = generateMockWeapon();

      const response = await request(app)
        .post('/api/weapons?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeWeapon,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Weapon created.',
        data: {
          id: 1,
          name: fakeWeapon.name,
          description: fakeWeapon.description,
          creator: fakeWeapon.creator,
          wielder: fakeWeapon.wielder,
          forged: fakeWeapon.forged,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeWeapon = generateMockWeapon();

      const response = await request(app)
        .post('/api/weapons?seriesId=1')
        .send({ ...fakeWeapon });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /weapons:weaponId', () => {
    it('gets a weapon belonging to the user and series', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .get('/api/weapons/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Weapon by id and series id fetched.',
        data: expect.objectContaining({
          id: weapon.id,
          name: weapon.name,
          description: weapon.description,
          creator: weapon.creator,
          wielder: weapon.wielder,
          forged: weapon.forged,
        }),
      });
    });

    it('fails if a weapon is not found belonging to a series', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .get('/api/weapons/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a weapon belonging to the user and book', async () => {
      const fakeWeapon = generateMockWeapon({}, [book]);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .get('/api/weapons/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Weapon by id and book id fetched.',
        data: expect.objectContaining({
          id: weapon.id,
          name: weapon.name,
          description: weapon.description,
          creator: weapon.creator,
          wielder: weapon.wielder,
          forged: weapon.forged,
        }),
      });
    });

    it('fails if a weapon is not found belonging to a book', async () => {
      const fakeWeapon = generateMockWeapon({}, [book]);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .get('/api/weapons/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .get('/api/weapons/1')
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
      const fakeWeapon = generateMockWeapon(series);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app).get('/api/weapons/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /weapons:weaponId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .patch('/api/weapons/1')
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
      const fakeWeapon = generateMockWeapon(series);
      const updatedFakeWeapon = generateMockWeapon();
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .patch('/api/weapons/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeWeapon,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a weapon belonging to a series or book cant be found', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const updatedFakeWeapon = generateMockWeapon();
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .patch('/api/weapons/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeWeapon,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a weapon belonging to the user and a series', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const updatedFakeWeapon = generateMockWeapon();
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .patch('/api/weapons/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeWeapon,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Weapon updated.',
        data: expect.objectContaining({
          id: weapon.id,
          name: updatedFakeWeapon.name,
          description: updatedFakeWeapon.description,
          creator: updatedFakeWeapon.creator,
          wielder: updatedFakeWeapon.wielder,
          forged: updatedFakeWeapon.forged,
        }),
      });
    });

    it('updates a weapon belonging to the user and a book', async () => {
      const fakeWeapon = generateMockWeapon({}, [book]);
      const updatedFakeWeapon = generateMockWeapon();
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .patch('/api/weapons/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeWeapon,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Weapon updated.',
        data: expect.objectContaining({
          id: weapon.id,
          name: updatedFakeWeapon.name,
          description: updatedFakeWeapon.description,
          creator: updatedFakeWeapon.creator,
          wielder: updatedFakeWeapon.wielder,
          forged: updatedFakeWeapon.forged,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const updatedFakeWeapon = generateMockWeapon();
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .patch('/api/weapons/1')
        .send({
          updatedData: {
            ...updatedFakeWeapon,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /weapons:weaponId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .delete('/api/weapons/1')
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
      const fakeWeapon = generateMockWeapon(series, [book]);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .delete('/api/weapons/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a weapon belonging to the user and a series', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .delete('/api/weapons/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Weapon deleted.',
      });
    });

    it('deletes a weapon belonging to the user and a book', async () => {
      const fakeWeapon = generateMockWeapon({}, [book]);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app)
        .delete('/api/weapons/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Weapon deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeWeapon = generateMockWeapon(series);
      const weapon = await weaponsRepository.create(fakeWeapon);
      await weaponsRepository.save(weapon);

      const response = await request(app).delete('/api/weapons/1?seriesId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

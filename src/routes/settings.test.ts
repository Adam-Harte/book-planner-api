import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockSetting } from '../mockData/settings';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import {
  getSettingsRepository,
  SettingsRepository,
} from '../repositories/settings';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Settings routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let settingsRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    settingsRepository = getSettingsRepository(testDataSource);
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
    SettingsRepository.create = jest
      .fn()
      .mockImplementation((setting: any) => settingsRepository.create(setting));
    SettingsRepository.save = jest
      .fn()
      .mockImplementation((setting: any) => settingsRepository.save(setting));
    SettingsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => settingsRepository.delete(id));
    SettingsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        settingsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    SettingsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        settingsRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    SettingsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (settingId: number, userId: number, seriesId: number) =>
          settingsRepository.getByUserIdAndSeriesId(settingId, userId, seriesId)
      );
    SettingsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((settingId: number, userId: number, bookId: number) =>
        settingsRepository.getByUserIdAndBookId(settingId, userId, bookId)
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

  describe('GET /settings', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeSetting1 = generateMockSetting(series, [book]);
      const fakeSetting2 = generateMockSetting(series, [book]);
      const setting1 = await settingsRepository.create(fakeSetting1);
      await settingsRepository.save(setting1);
      const setting2 = await settingsRepository.create(fakeSetting2);
      await settingsRepository.save(setting2);

      const response = await request(app)
        .get('/api/settings')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the settings belonging to the user and a series', async () => {
      const fakeSetting1 = generateMockSetting(series);
      const fakeSetting2 = generateMockSetting(series);
      const setting1 = await settingsRepository.create(fakeSetting1);
      await settingsRepository.save(setting1);
      const setting2 = await settingsRepository.create(fakeSetting2);
      await settingsRepository.save(setting2);

      const response = await request(app)
        .get('/api/settings?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Settings by user id and series id fetched.',
        data: [
          {
            id: setting1.id,
            name: setting1.name,
            description: setting1.description,
            type: setting1.type,
          },
          {
            id: setting2.id,
            name: setting2.name,
            description: setting2.description,
            type: setting2.type,
          },
        ],
      });
    });

    it('gets all the settings belonging to the user and a book', async () => {
      const fakeSetting1 = generateMockSetting({}, [book]);
      const fakeSetting2 = generateMockSetting({}, [book]);
      const setting1 = await settingsRepository.create(fakeSetting1);
      await settingsRepository.save(setting1);
      const setting2 = await settingsRepository.create(fakeSetting2);
      await settingsRepository.save(setting2);

      const response = await request(app)
        .get('/api/settings?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Settings by user id and book id fetched.',
        data: [
          {
            id: setting1.id,
            name: setting1.name,
            description: setting1.description,
            type: setting1.type,
          },
          {
            id: setting2.id,
            name: setting2.name,
            description: setting2.description,
            type: setting2.type,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSetting1 = generateMockSetting(series, [book]);
      const fakeSetting2 = generateMockSetting(series, [book]);
      const setting1 = await settingsRepository.create(fakeSetting1);
      await settingsRepository.save(setting1);
      const setting2 = await settingsRepository.create(fakeSetting2);
      await settingsRepository.save(setting2);

      const response = await request(app).get(
        '/api/settings?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /settings', () => {
    it('fails validation when no name sent', async () => {
      const fakeSetting = generateMockSetting();

      const response = await request(app)
        .post('/api/settings')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          type: fakeSetting.type,
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
      const fakeSetting = generateMockSetting();

      const response = await request(app)
        .post('/api/settings')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeSetting,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeSetting = generateMockSetting();

      const response = await request(app)
        .post('/api/settings?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeSetting,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A setting must be created belonging to one of your series or books.',
      });
    });

    it('creates a new setting related to a series when /settings route is passed correct data and seriesId query param', async () => {
      const fakeSetting = generateMockSetting();

      const response = await request(app)
        .post('/api/settings?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeSetting,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Setting created.',
        data: {
          id: 1,
          name: fakeSetting.name,
          description: fakeSetting.description,
          type: fakeSetting.type,
        },
      });
    });

    it('creates a new setting related to a book when /settings route is passed correct data and bookId query param', async () => {
      const fakeSetting = generateMockSetting();

      const response = await request(app)
        .post('/api/settings?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeSetting,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Setting created.',
        data: {
          id: 1,
          name: fakeSetting.name,
          description: fakeSetting.description,
          type: fakeSetting.type,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSetting = generateMockSetting();

      const response = await request(app)
        .post('/api/settings?seriesId=1')
        .send({ ...fakeSetting });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /settings:settingId', () => {
    it('gets a setting belonging to the user and series', async () => {
      const fakeSetting = generateMockSetting(series);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .get('/api/settings/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Setting by id and series id fetched.',
        data: expect.objectContaining({
          id: setting.id,
          name: setting.name,
          description: setting.description,
          type: setting.type,
        }),
      });
    });

    it('fails if a setting is not found belonging to a series', async () => {
      const fakeSetting = generateMockSetting(series);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .get('/api/settings/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a setting belonging to the user and book', async () => {
      const fakeSetting = generateMockSetting({}, [book]);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .get('/api/settings/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Setting by id and book id fetched.',
        data: expect.objectContaining({
          id: setting.id,
          name: setting.name,
          description: setting.description,
          type: setting.type,
        }),
      });
    });

    it('fails if a setting is not found belonging to a book', async () => {
      const fakeSetting = generateMockSetting({}, [book]);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .get('/api/settings/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeSetting = generateMockSetting(series, [book]);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .get('/api/settings/1')
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
      const fakeSetting = generateMockSetting(series);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app).get('/api/settings/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /settings:settingId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeSetting = generateMockSetting(series, [book]);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .patch('/api/settings/1')
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
      const fakeSetting = generateMockSetting(series);
      const updatedFakeSetting = generateMockSetting();
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .patch('/api/settings/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeSetting,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a setting belonging to a series or book cant be found', async () => {
      const fakeSetting = generateMockSetting(series, [book]);
      const updatedFakeSetting = generateMockSetting();
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .patch('/api/settings/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeSetting,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a setting belonging to the user and a series', async () => {
      const fakeSetting = generateMockSetting(series);
      const updatedFakeSetting = generateMockSetting(series);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .patch('/api/settings/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeSetting,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Setting updated.',
        data: expect.objectContaining({
          id: setting.id,
          name: updatedFakeSetting.name,
          description: updatedFakeSetting.description,
          type: updatedFakeSetting.type,
        }),
      });
    });

    it('updates a setting belonging to the user and a book', async () => {
      const fakeSetting = generateMockSetting({}, [book]);
      const updatedFakeSetting = generateMockSetting();
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .patch('/api/settings/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeSetting,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Setting updated.',
        data: expect.objectContaining({
          id: setting.id,
          name: updatedFakeSetting.name,
          description: updatedFakeSetting.description,
          type: updatedFakeSetting.type,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSetting = generateMockSetting({}, [book]);
      const updatedFakeSetting = generateMockSetting();
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .patch('/api/settings/1')
        .send({
          updatedData: {
            ...updatedFakeSetting,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /settings:settingId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeSetting = generateMockSetting(series, [book]);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .delete('/api/settings/1')
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
      const fakeSetting = generateMockSetting(series);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .delete('/api/settings/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a setting belonging to the user and a series', async () => {
      const fakeSetting = generateMockSetting(series);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .delete('/api/settings/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Setting deleted.',
      });
    });

    it('deletes a setting belonging to the user and a book', async () => {
      const fakeSetting = generateMockSetting({}, [book]);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app)
        .delete('/api/settings/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Setting deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeSetting = generateMockSetting(series);
      const setting = await settingsRepository.create(fakeSetting);
      await settingsRepository.save(setting);

      const response = await request(app).delete('/api/settings/1?seriesId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

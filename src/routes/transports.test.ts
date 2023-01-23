import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockTransport } from '../mockData/transports';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import {
  getTransportsRepository,
  TransportsRepository,
} from '../repositories/transports';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Transports routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let transportsRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    transportsRepository = getTransportsRepository(testDataSource);
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
    TransportsRepository.create = jest
      .fn()
      .mockImplementation((transport: any) =>
        transportsRepository.create(transport)
      );
    TransportsRepository.save = jest
      .fn()
      .mockImplementation((transport: any) =>
        transportsRepository.save(transport)
      );
    TransportsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => transportsRepository.delete(id));
    TransportsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        transportsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    TransportsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        transportsRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    TransportsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (transportId: number, userId: number, seriesId: number) =>
          transportsRepository.getByUserIdAndSeriesId(
            transportId,
            userId,
            seriesId
          )
      );
    TransportsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (transportId: number, userId: number, bookId: number) =>
          transportsRepository.getByUserIdAndBookId(transportId, userId, bookId)
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

  describe('GET /transports', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeTransport1 = generateMockTransport(series, [book]);
      const fakeTransport2 = generateMockTransport(series, [book]);
      const transport1 = await transportsRepository.create(fakeTransport1);
      await transportsRepository.save(transport1);
      const transport2 = await transportsRepository.create(fakeTransport2);
      await transportsRepository.save(transport2);

      const response = await request(app)
        .get('/api/transports')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the transports belonging to the user and a series', async () => {
      const fakeTransport1 = generateMockTransport(series);
      const fakeTransport2 = generateMockTransport(series);
      const transport1 = await transportsRepository.create(fakeTransport1);
      await transportsRepository.save(transport1);
      const transport2 = await transportsRepository.create(fakeTransport2);
      await transportsRepository.save(transport2);

      const response = await request(app)
        .get('/api/transports?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Transports by user id and series id fetched.',
        data: [
          {
            id: transport1.id,
            name: transport1.name,
            description: transport1.description,
          },
          {
            id: transport2.id,
            name: transport2.name,
            description: transport2.description,
          },
        ],
      });
    });

    it('gets all the transports belonging to the user and a book', async () => {
      const fakeTransport1 = generateMockTransport({}, [book]);
      const fakeTransport2 = generateMockTransport({}, [book]);
      const transport1 = await transportsRepository.create(fakeTransport1);
      await transportsRepository.save(transport1);
      const transport2 = await transportsRepository.create(fakeTransport2);
      await transportsRepository.save(transport2);

      const response = await request(app)
        .get('/api/transports?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Transports by user id and book id fetched.',
        data: [
          {
            id: transport1.id,
            name: transport1.name,
            description: transport1.description,
          },
          {
            id: transport2.id,
            name: transport2.name,
            description: transport2.description,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeTransport1 = generateMockTransport(series, [book]);
      const fakeTransport2 = generateMockTransport(series, [book]);
      const transport1 = await transportsRepository.create(fakeTransport1);
      await transportsRepository.save(transport1);
      const transport2 = await transportsRepository.create(fakeTransport2);
      await transportsRepository.save(transport2);

      const response = await request(app).get(
        '/api/transports?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /transports', () => {
    it('fails validation when no name sent', async () => {
      const fakeTransport = generateMockTransport();

      const response = await request(app)
        .post('/api/transports')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          description: fakeTransport.description,
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
      const fakeTransport = generateMockTransport();

      const response = await request(app)
        .post('/api/transports')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeTransport,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeTransport = generateMockTransport();

      const response = await request(app)
        .post('/api/transports?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeTransport,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A transport must be created belonging to one of your series or books.',
      });
    });

    it('creates a new transport related to a series when /transports route is passed correct data and seriesId query param', async () => {
      const fakeTransport = generateMockTransport();

      const response = await request(app)
        .post('/api/transports?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeTransport,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Transport created.',
        data: {
          id: 1,
          name: fakeTransport.name,
          description: fakeTransport.description,
        },
      });
    });

    it('creates a new transport related to a book when /transports route is passed correct data and bookId query param', async () => {
      const fakeTransport = generateMockTransport();

      const response = await request(app)
        .post('/api/transports?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeTransport,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Transport created.',
        data: {
          id: 1,
          name: fakeTransport.name,
          description: fakeTransport.description,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeTransport = generateMockTransport();

      const response = await request(app)
        .post('/api/transports?seriesId=1')
        .send({ ...fakeTransport });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /transports:transportId', () => {
    it('gets a transport belonging to the user and series', async () => {
      const fakeTransport = generateMockTransport(series);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .get('/api/transports/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Transport by id and series id fetched.',
        data: expect.objectContaining({
          id: transport.id,
          name: transport.name,
          description: transport.description,
        }),
      });
    });

    it('fails if a transport is not found belonging to a series', async () => {
      const fakeTransport = generateMockTransport(series);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .get('/api/transports/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a transport belonging to the user and book', async () => {
      const fakeTransport = generateMockTransport({}, [book]);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .get('/api/transports/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Transport by id and book id fetched.',
        data: expect.objectContaining({
          id: transport.id,
          name: transport.name,
          description: transport.description,
        }),
      });
    });

    it('fails if a transport is not found belonging to a book', async () => {
      const fakeTransport = generateMockTransport({}, [book]);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .get('/api/transports/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeTransport = generateMockTransport(series);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .get('/api/transports/1')
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
      const fakeTransport = generateMockTransport(series);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app).get('/api/transports/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /transports:transportId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeTransport = generateMockTransport(series);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .patch('/api/transports/1')
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
      const fakeTransport = generateMockTransport(series);
      const updatedFakeTransport = generateMockTransport();
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .patch('/api/transports/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeTransport,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a transport belonging to a series or book cant be found', async () => {
      const fakeTransport = generateMockTransport(series, [book]);
      const updatedFakeTransport = generateMockTransport();
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .patch('/api/transports/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeTransport,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a transport belonging to the user and a series', async () => {
      const fakeTransport = generateMockTransport(series);
      const updatedFakeTransport = generateMockTransport();
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .patch('/api/transports/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeTransport,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Transport updated.',
        data: expect.objectContaining({
          id: transport.id,
          name: updatedFakeTransport.name,
          description: updatedFakeTransport.description,
        }),
      });
    });

    it('updates a transport belonging to the user and a book', async () => {
      const fakeTransport = generateMockTransport({}, [book]);
      const updatedFakeTransport = generateMockTransport();
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .patch('/api/transports/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeTransport,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Transport updated.',
        data: expect.objectContaining({
          id: transport.id,
          name: updatedFakeTransport.name,
          description: updatedFakeTransport.description,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeTransport = generateMockTransport(series);
      const updatedFakeTransport = generateMockTransport();
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .patch('/api/transports/1')
        .send({
          updatedData: {
            ...updatedFakeTransport,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /transports:transportId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeTransport = generateMockTransport(series);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .delete('/api/transports/1')
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
      const fakeTransport = generateMockTransport(series, [book]);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .delete('/api/transports/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a transport belonging to the user and a series', async () => {
      const fakeTransport = generateMockTransport(series);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .delete('/api/transports/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Transport deleted.',
      });
    });

    it('deletes a transport belonging to the user and a book', async () => {
      const fakeTransport = generateMockTransport(series, [book]);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app)
        .delete('/api/transports/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Transport deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeTransport = generateMockTransport(series);
      const transport = await transportsRepository.create(fakeTransport);
      await transportsRepository.save(transport);

      const response = await request(app).delete(
        '/api/transports/1?seriesId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

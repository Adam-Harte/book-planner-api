import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockPlotReference } from '../mockData/plotReferences';
import { generateMockSeries } from '../mockData/series';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import {
  getPlotReferencesRepository,
  PlotReferencesRepository,
} from '../repositories/plotReferences';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('PlotReferences routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let plotReferencesRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    plotReferencesRepository = getPlotReferencesRepository(testDataSource);
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
    PlotReferencesRepository.create = jest
      .fn()
      .mockImplementation((plotRef: any) =>
        plotReferencesRepository.create(plotRef)
      );
    PlotReferencesRepository.save = jest
      .fn()
      .mockImplementation((plotRef: any) =>
        plotReferencesRepository.save(plotRef)
      );
    PlotReferencesRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => plotReferencesRepository.delete(id));
    PlotReferencesRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        plotReferencesRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    PlotReferencesRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        plotReferencesRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    PlotReferencesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (plotRefId: number, userId: number, seriesId: number) =>
          plotReferencesRepository.getByUserIdAndSeriesId(
            plotRefId,
            userId,
            seriesId
          )
      );
    PlotReferencesRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((plotRefId: number, userId: number, bookId: number) =>
        plotReferencesRepository.getByUserIdAndBookId(plotRefId, userId, bookId)
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

  describe('GET /plot-references', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakePlotRef1 = generateMockPlotReference(series, book);
      const fakePlotRef2 = generateMockPlotReference(series, book);
      const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
      await plotReferencesRepository.save(plotRef1);
      const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
      await plotReferencesRepository.save(plotRef2);

      const response = await request(app)
        .get('/api/plot-references')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the plot references belonging to the user and a series', async () => {
      const fakePlotRef1 = generateMockPlotReference(series);
      const fakePlotRef2 = generateMockPlotReference(series);
      const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
      await plotReferencesRepository.save(plotRef1);
      const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
      await plotReferencesRepository.save(plotRef2);

      const response = await request(app)
        .get('/api/plot-references?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot References by user id and series id fetched.',
        data: [
          {
            id: plotRef1.id,
            name: plotRef1.name,
            type: plotRef1.type,
            referenceId: plotRef1.referenceId,
          },
          {
            id: plotRef2.id,
            name: plotRef2.name,
            type: plotRef2.type,
            referenceId: plotRef2.referenceId,
          },
        ],
      });
    });

    it('gets all the plot references belonging to the user and a book', async () => {
      const fakePlotRef1 = generateMockPlotReference(series, book);
      const fakePlotRef2 = generateMockPlotReference(series, book);
      const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
      await plotReferencesRepository.save(plotRef1);
      const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
      await plotReferencesRepository.save(plotRef2);

      const response = await request(app)
        .get('/api/plot-references?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot References by user id and book id fetched.',
        data: [
          {
            id: plotRef1.id,
            name: plotRef1.name,
            type: plotRef1.type,
            referenceId: plotRef1.referenceId,
          },
          {
            id: plotRef2.id,
            name: plotRef2.name,
            type: plotRef2.type,
            referenceId: plotRef2.referenceId,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakePlotRef1 = generateMockPlotReference(series, book);
      const fakePlotRef2 = generateMockPlotReference(series, book);
      const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
      await plotReferencesRepository.save(plotRef1);
      const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
      await plotReferencesRepository.save(plotRef2);

      const response = await request(app).get(
        '/api/plot-references?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /plot-references', () => {
    it('fails validation when no name sent', async () => {
      const fakePlotRef = generateMockPlotReference();

      const response = await request(app)
        .post('/api/plot-references')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          type: fakePlotRef.type,
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
      const fakePlotRef = generateMockPlotReference();

      const response = await request(app)
        .post('/api/plot-references')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakePlotRef,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakePlotRef = generateMockPlotReference();

      const response = await request(app)
        .post('/api/plot-references?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakePlotRef,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A plot reference must be created belonging to one of your series or books.',
      });
    });

    it('creates a new plot reference related to a series when /plot-references route is passed correct data and seriesId query param', async () => {
      const fakePlotRef = generateMockPlotReference();

      const response = await request(app)
        .post('/api/plot-references?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakePlotRef,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Plot Reference created.',
        data: {
          id: 1,
          name: fakePlotRef.name,
          type: fakePlotRef.type,
          referenceId: fakePlotRef.referenceId,
        },
      });
    });

    it('creates a new plot reference related to a book when /plot-references route is passed correct data and bookId query param', async () => {
      const fakePlotRef = generateMockPlotReference();

      const response = await request(app)
        .post('/api/plot-references?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakePlotRef,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Plot Reference created.',
        data: {
          id: 1,
          name: fakePlotRef.name,
          type: fakePlotRef.type,
          referenceId: fakePlotRef.referenceId,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakePlotRef = generateMockPlotReference();

      const response = await request(app)
        .post('/api/plot-references?seriesId=1')
        .send({ ...fakePlotRef });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /plot-references:plotReferenceId', () => {
    it('gets a plot reference belonging to the user and series', async () => {
      const fakePlotRef = generateMockPlotReference(series);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .get('/api/plot-references/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot Reference by id and series id fetched.',
        data: expect.objectContaining({
          id: plotRef.id,
          name: plotRef.name,
          type: plotRef.type,
          referenceId: plotRef.referenceId,
        }),
      });
    });

    it('fails if a plot reference is not found belonging to a series', async () => {
      const fakePlotRef = generateMockPlotReference(series);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .get('/api/plot-references/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a plot reference belonging to the user and book', async () => {
      const fakePlotRef = generateMockPlotReference({}, book);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .get('/api/plot-references/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot Reference by id and book id fetched.',
        data: expect.objectContaining({
          id: plotRef.id,
          name: plotRef.name,
          type: plotRef.type,
          referenceId: plotRef.referenceId,
        }),
      });
    });

    it('fails if a plot reference is not found belonging to a book', async () => {
      const fakePlotRef = generateMockPlotReference({}, book);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .get('/api/plot-references/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakePlotRef = generateMockPlotReference(series);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .get('/api/plot-references/1')
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
      const fakePlotRef = generateMockPlotReference(series);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app).get('/api/plot-references/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /plot-references:plotReferenceId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakePlotRef = generateMockPlotReference(series);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .patch('/api/plot-references/1')
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
      const fakePlotRef = generateMockPlotReference(series);
      const updatedFakePlotRef = generateMockPlotReference();
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .patch('/api/plot-references/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakePlotRef,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a plot reference belonging to a series or book cant be found', async () => {
      const fakePlotRef = generateMockPlotReference(series, book);
      const updatedFakePlotRef = generateMockPlotReference();
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .patch('/api/plot-references/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakePlotRef,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a plot reference belonging to the user and a series', async () => {
      const fakePlotRef = generateMockPlotReference(series);
      const updatedFakePlotRef = generateMockPlotReference();
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .patch('/api/plot-references/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakePlotRef,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot Reference updated.',
        data: expect.objectContaining({
          id: plotRef.id,
          name: updatedFakePlotRef.name,
          type: updatedFakePlotRef.type,
          referenceId: updatedFakePlotRef.referenceId,
        }),
      });
    });

    it('updates a plot reference belonging to the user and a book', async () => {
      const fakePlotRef = generateMockPlotReference({}, book);
      const updatedFakePlotRef = generateMockPlotReference();
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .patch('/api/plot-references/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakePlotRef,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot Reference updated.',
        data: expect.objectContaining({
          id: plotRef.id,
          name: updatedFakePlotRef.name,
          type: updatedFakePlotRef.type,
          referenceId: updatedFakePlotRef.referenceId,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakePlotRef = generateMockPlotReference(series);
      const updatedFakePlotRef = generateMockPlotReference();
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .patch('/api/plot-references/1')
        .send({
          updatedData: {
            ...updatedFakePlotRef,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /plot-references:plotReferenceId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakePlotRef = generateMockPlotReference(series, book);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .delete('/api/plot-references/1')
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
      const fakePlotRef = generateMockPlotReference(series, book);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .delete('/api/plot-references/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a plot reference belonging to the user and a series', async () => {
      const fakePlotRef = generateMockPlotReference(series);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .delete('/api/plot-references/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot Reference deleted.',
      });
    });

    it('deletes a plot reference belonging to the user and a book', async () => {
      const fakePlotRef = generateMockPlotReference({}, book);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app)
        .delete('/api/plot-references/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot Reference deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakePlotRef = generateMockPlotReference(series);
      const plotRef = await plotReferencesRepository.create(fakePlotRef);
      await plotReferencesRepository.save(plotRef);

      const response = await request(app).delete(
        '/api/plot-references/1?seriesId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

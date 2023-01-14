import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockPlot } from '../mockData/plots';
import { generateMockSeries } from '../mockData/series';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getPlotsRepository, PlotsRepository } from '../repositories/plots';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Plots routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let plotsRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    plotsRepository = getPlotsRepository(testDataSource);
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
    PlotsRepository.create = jest
      .fn()
      .mockImplementation((plot: any) => plotsRepository.create(plot));
    PlotsRepository.save = jest
      .fn()
      .mockImplementation((plot: any) => plotsRepository.save(plot));
    PlotsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => plotsRepository.delete(id));
    PlotsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        plotsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    PlotsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        plotsRepository.getAllByUserIdAndBookId(userId, bookId)
      );
    PlotsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((plotId: number, userId: number, seriesId: number) =>
        plotsRepository.getByUserIdAndSeriesId(plotId, userId, seriesId)
      );
    PlotsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((plotId: number, userId: number, bookId: number) =>
        plotsRepository.getByUserIdAndBookId(plotId, userId, bookId)
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

  describe('GET /plots', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakePlot1 = generateMockPlot(series, book);
      const fakePlot2 = generateMockPlot(series, book);
      const plot1 = await plotsRepository.create(fakePlot1);
      await plotsRepository.save(plot1);
      const plot2 = await plotsRepository.create(fakePlot2);
      await plotsRepository.save(plot2);

      const response = await request(app)
        .get('/api/plots')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the plots belonging to the user and a series', async () => {
      const fakePlot1 = generateMockPlot(series);
      const fakePlot2 = generateMockPlot(series);
      const plot1 = await plotsRepository.create(fakePlot1);
      await plotsRepository.save(plot1);
      const plot2 = await plotsRepository.create(fakePlot2);
      await plotsRepository.save(plot2);

      const response = await request(app)
        .get('/api/plots?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plots by user id and series id fetched.',
        data: [
          {
            id: plot1.id,
            name: plot1.name,
            type: plot1.type,
            description: plot1.description,
          },
          {
            id: plot2.id,
            name: plot2.name,
            type: plot2.type,
            description: plot2.description,
          },
        ],
      });
    });

    it('gets all the plots belonging to the user and a book', async () => {
      const fakePlot1 = generateMockPlot({}, book);
      const fakePlot2 = generateMockPlot({}, book);
      const plot1 = await plotsRepository.create(fakePlot1);
      await plotsRepository.save(plot1);
      const plot2 = await plotsRepository.create(fakePlot2);
      await plotsRepository.save(plot2);

      const response = await request(app)
        .get('/api/plots?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plots by user id and book id fetched.',
        data: [
          {
            id: plot1.id,
            name: plot1.name,
            type: plot1.type,
            description: plot1.description,
          },
          {
            id: plot2.id,
            name: plot2.name,
            type: plot2.type,
            description: plot2.description,
          },
        ],
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakePlot1 = generateMockPlot(series, book);
      const fakePlot2 = generateMockPlot(series, book);
      const plot1 = await plotsRepository.create(fakePlot1);
      await plotsRepository.save(plot1);
      const plot2 = await plotsRepository.create(fakePlot2);
      await plotsRepository.save(plot2);

      const response = await request(app).get('/api/plots?seriesId=1&bookId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /plots', () => {
    it('fails validation when no name sent', async () => {
      const fakePlot = generateMockPlot();

      const response = await request(app)
        .post('/api/plots')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          description: fakePlot.description,
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
      const fakePlot = generateMockPlot();

      const response = await request(app)
        .post('/api/plots')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakePlot,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakePlot = generateMockPlot();

      const response = await request(app)
        .post('/api/plots?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakePlot,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A plot must be created belonging to one of your series or books.',
      });
    });

    it('creates a new plot related to a series when /plots route is passed correct data and seriesId query param', async () => {
      const fakePlot = generateMockPlot();

      const response = await request(app)
        .post('/api/plots?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakePlot,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Plot created.',
        data: {
          id: 1,
          name: fakePlot.name,
          type: fakePlot.type,
          description: fakePlot.description,
        },
      });
    });

    it('creates a new plot related to a book when /plots route is passed correct data and bookId query param', async () => {
      const fakePlot = generateMockPlot();

      const response = await request(app)
        .post('/api/plots?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakePlot,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Plot created.',
        data: {
          id: 1,
          name: fakePlot.name,
          type: fakePlot.type,
          description: fakePlot.description,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakePlot = generateMockPlot();

      const response = await request(app)
        .post('/api/plots?seriesId=1')
        .send({ ...fakePlot });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /plots:plotId', () => {
    it('gets a plot belonging to the user and series', async () => {
      const fakePlot = generateMockPlot(series);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .get('/api/plots/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot by id and series id fetched.',
        data: expect.objectContaining({
          id: plot.id,
          name: plot.name,
          type: plot.type,
          description: plot.description,
        }),
      });
    });

    it('fails if a plot is not found belonging to a series', async () => {
      const fakePlot = generateMockPlot(series);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .get('/api/plots/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a plot belonging to the user and book', async () => {
      const fakePlot = generateMockPlot({}, book);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .get('/api/plots/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot by id and book id fetched.',
        data: expect.objectContaining({
          id: plot.id,
          name: plot.name,
          type: plot.type,
          description: plot.description,
        }),
      });
    });

    it('fails if a plot is not found belonging to a book', async () => {
      const fakePlot = generateMockPlot({}, book);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .get('/api/plots/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakePlot = generateMockPlot(series);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .get('/api/plots/1')
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
      const fakePlot = generateMockPlot(series);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app).get('/api/plots/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /plots:plotId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakePlot = generateMockPlot(series);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .patch('/api/plots/1')
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
      const fakePlot = generateMockPlot(series);
      const updatedFakePlot = generateMockPlot();
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .patch('/api/plots/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakePlot,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a plot belonging to a series or book cant be found', async () => {
      const fakePlot = generateMockPlot(series, book);
      const updatedFakePlot = generateMockPlot();
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .patch('/api/plots/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakePlot,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a plot belonging to the user and a series', async () => {
      const fakePlot = generateMockPlot(series);
      const updatedFakePlot = generateMockPlot();
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .patch('/api/plots/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakePlot,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot updated.',
        data: expect.objectContaining({
          id: plot.id,
          name: updatedFakePlot.name,
          type: updatedFakePlot.type,
          description: updatedFakePlot.description,
        }),
      });
    });

    it('updates a plot belonging to the user and a book', async () => {
      const fakePlot = generateMockPlot({}, book);
      const updatedFakePlot = generateMockPlot();
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .patch('/api/plots/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakePlot,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot updated.',
        data: expect.objectContaining({
          id: plot.id,
          name: updatedFakePlot.name,
          type: updatedFakePlot.type,
          description: updatedFakePlot.description,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakePlot = generateMockPlot(series);
      const updatedFakePlot = generateMockPlot();
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .patch('/api/plots/1')
        .send({
          updatedData: {
            ...updatedFakePlot,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /plots:plotId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakePlot = generateMockPlot(series, book);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .delete('/api/plots/1')
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
      const fakePlot = generateMockPlot(series, book);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .delete('/api/plots/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a plot belonging to the user and a series', async () => {
      const fakePlot = generateMockPlot(series);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .delete('/api/plots/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot deleted.',
      });
    });

    it('deletes a plot belonging to the user and a book', async () => {
      const fakePlot = generateMockPlot({}, book);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app)
        .delete('/api/plots/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Plot deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakePlot = generateMockPlot(series);
      const plot = await plotsRepository.create(fakePlot);
      await plotsRepository.save(plot);

      const response = await request(app).delete('/api/plots/1?seriesId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

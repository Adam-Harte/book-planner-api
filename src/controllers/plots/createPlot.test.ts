import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockPlot } from '../../mockData/plots';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import { getPlotsRepository, PlotsRepository } from '../../repositories/plots';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  createPlot,
  CreatePlotReqBody,
  CreatePlotReqQuery,
} from './createPlot';

describe('createPlot', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let plotsRepository: any;
  let fakeUser: any;
  let user: any;
  let fakeSeries: any;
  let series: any;
  let fakeBook: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
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
    dbBackup = testDb.backup();
  });

  beforeEach(async () => {
    dbBackup.restore();
    fakeUser = generateMockUser();
    user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);
    fakeSeries = generateMockSeries(user);
    series = await seriesRepository.create(fakeSeries);
    await seriesRepository.save(series);
    fakeBook = generateMockBook(user);
    book = await booksRepository.create(fakeBook);
    await booksRepository.save(book);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('fails if neither the seriesId or bookId query params are passed', async () => {
    const fakePlot = generateMockPlot();
    const req = getMockReq({
      body: {
        name: fakePlot.name,
        type: fakePlot.type,
        description: fakePlot.description,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createPlot(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreatePlotReqBody,
        CreatePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.create).not.toHaveBeenCalled();
    expect(PlotsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new Plot belonging to a series', async () => {
    const fakePlot = generateMockPlot(series);
    const req = getMockReq({
      body: {
        name: fakePlot.name,
        type: fakePlot.type,
        description: fakePlot.description,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createPlot(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreatePlotReqBody,
        CreatePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(PlotsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot created.',
      data: {
        id: 1,
        name: fakePlot.name,
        type: fakePlot.type,
        description: fakePlot.description,
      },
    });
  });

  it('should create a new Plot belonging to a book', async () => {
    const fakePlot = generateMockPlot({}, book);
    const req = getMockReq({
      body: {
        name: fakePlot.name,
        type: fakePlot.type,
        description: fakePlot.description,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createPlot(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreatePlotReqBody,
        CreatePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      book: expect.objectContaining({
        id: 1,
        name: fakeBook.name,
        genre: fakeBook.genre,
      }),
    });
    expect(PlotsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        book: expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot created.',
      data: {
        id: 1,
        name: fakePlot.name,
        type: fakePlot.type,
        description: fakePlot.description,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the plot', async () => {
    const fakePlot = generateMockPlot(series, book);
    const req = getMockReq({
      body: {
        name: fakePlot.name,
        type: fakePlot.type,
        description: fakePlot.description,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createPlot(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreatePlotReqBody,
        CreatePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.create).not.toHaveBeenCalled();
    expect(PlotsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A plot must be created belonging to one of your series or books.',
    });
  });
});

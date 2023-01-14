import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockPlot } from '../../mockData/plots';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import { getPlotsRepository, PlotsRepository } from '../../repositories/plots';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  getPlotById,
  GetPlotByIdReqParams,
  GetPlotByIdReqQuery,
} from './getPlotById';

describe('getPlotById', () => {
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

  it('should fail if the plot does not belong to the users series', async () => {
    const fakePlot = generateMockPlot(series);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getPlotById(
      req as unknown as Request<
        GetPlotByIdReqParams,
        unknown,
        unknown,
        GetPlotByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      2
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the plot does not belong to the users book', async () => {
    const fakePlot = generateMockPlot({}, book);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getPlotById(
      req as unknown as Request<
        GetPlotByIdReqParams,
        unknown,
        unknown,
        GetPlotByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(1, 1, 2);
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if neither seriesId or bookId query params are passed', async () => {
    const fakePlot = generateMockPlot(series);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getPlotById(
      req as unknown as Request<
        GetPlotByIdReqParams,
        unknown,
        unknown,
        GetPlotByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.getByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(PlotsRepository.getByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should get one plot by a specific id and series id', async () => {
    const fakePlot = generateMockPlot(series);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getPlotById(
      req as unknown as Request<
        GetPlotByIdReqParams,
        unknown,
        unknown,
        GetPlotByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.getByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot by id and series id fetched.',
      data: {
        id: plot.id,
        name: plot.name,
        type: plot.type,
        description: plot.description,
      },
    });
  });

  it('should get one plot by a specific id and book id', async () => {
    const fakePlot = generateMockPlot({}, book);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await getPlotById(
      req as unknown as Request<
        GetPlotByIdReqParams,
        unknown,
        unknown,
        GetPlotByIdReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.getByUserIdAndBookId).toHaveBeenCalledWith(1, 1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot by id and book id fetched.',
      data: {
        id: plot.id,
        name: plot.name,
        type: plot.type,
        description: plot.description,
      },
    });
  });
});

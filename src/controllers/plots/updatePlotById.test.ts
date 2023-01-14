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
  updatePlotById,
  UpdatePlotReqBody,
  UpdatePlotReqParams,
  UpdatePlotReqQuery,
} from './updatePlotById';

describe('updatePlotById', () => {
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
    PlotsRepository.save = jest
      .fn()
      .mockImplementation((plot: any) => plotsRepository.save(plot));
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakePlot = generateMockPlot(series, book);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updatePlotById(
      req as unknown as Request<
        UpdatePlotReqParams,
        unknown,
        UpdatePlotReqBody,
        UpdatePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a plot is not fetched by a series or book id', async () => {
    const fakePlot = generateMockPlot(series, book);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updatePlotById(
      req as unknown as Request<
        UpdatePlotReqParams,
        unknown,
        UpdatePlotReqBody,
        UpdatePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a plot by a specific id and series id', async () => {
    const fakePlot = generateMockPlot(series);
    const updatedFakePlot = generateMockPlot();

    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakePlot,
        },
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updatePlotById(
      req as unknown as Request<
        UpdatePlotReqParams,
        unknown,
        UpdatePlotReqBody,
        UpdatePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakePlot)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot updated.',
      data: {
        id: 1,
        name: updatedFakePlot.name,
        type: updatedFakePlot.type,
        description: updatedFakePlot.description,
      },
    });
  });

  it('should update a plot by a specific id and book id', async () => {
    const fakePlot = generateMockPlot({}, book);
    const updatedFakePlot = generateMockPlot();

    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakePlot,
        },
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updatePlotById(
      req as unknown as Request<
        UpdatePlotReqParams,
        unknown,
        UpdatePlotReqBody,
        UpdatePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakePlot)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot updated.',
      data: {
        id: 1,
        name: updatedFakePlot.name,
        type: updatedFakePlot.type,
        description: updatedFakePlot.description,
      },
    });
  });
});

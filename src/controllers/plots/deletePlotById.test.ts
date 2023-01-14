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
  deletePlotById,
  DeletePlotReqParams,
  DeletePlotReqQuery,
} from './deletePlotById';

describe('deletePlotById', () => {
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
    PlotsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => plotsRepository.delete(id));
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

  it('should fail if neither seriesId or bookId query params are passed', async () => {
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

    await deletePlotById(
      req as unknown as Request<
        DeletePlotReqParams,
        unknown,
        unknown,
        DeletePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if the plot being deleted does not belong to a series', async () => {
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

    await deletePlotById(
      req as unknown as Request<
        DeletePlotReqParams,
        unknown,
        unknown,
        DeletePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the plot being deleted does not belong to a book', async () => {
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

    await deletePlotById(
      req as unknown as Request<
        DeletePlotReqParams,
        unknown,
        unknown,
        DeletePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should delete the plot by a specific id', async () => {
    const fakePlot = generateMockPlot({}, book);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const req = getMockReq({
      params: {
        plotId: '1',
      },
      query: {
        seriesId: '1',
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deletePlotById(
      req as unknown as Request<
        DeletePlotReqParams,
        unknown,
        unknown,
        DeletePlotReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.delete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot deleted.',
    });
  });
});

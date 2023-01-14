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
import { getPlots, GetPlotsReqQuery } from './getPlots';

describe('getPlots', () => {
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

  it('should get all plots belonging to the user and a series', async () => {
    const fakePlot1 = generateMockPlot(series);
    const fakePlot2 = generateMockPlot(series);

    const plot1 = await plotsRepository.create(fakePlot1);
    await plotsRepository.save(plot1);

    const plot2 = await plotsRepository.create(fakePlot2);
    await plotsRepository.save(plot2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getPlots(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetPlotsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
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

  it('should get all plots belonging to the user and a book', async () => {
    const fakePlot1 = generateMockPlot({}, book);
    const fakePlot2 = generateMockPlot({}, book);

    const plot1 = await plotsRepository.create(fakePlot1);
    await plotsRepository.save(plot1);

    const plot2 = await plotsRepository.create(fakePlot2);
    await plotsRepository.save(plot2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getPlots(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetPlotsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakePlot1 = generateMockPlot(series, book);
    const fakePlot2 = generateMockPlot(series, book);

    const plot1 = await plotsRepository.create(fakePlot1);
    await plotsRepository.save(plot1);

    const plot2 = await plotsRepository.create(fakePlot2);
    await plotsRepository.save(plot2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getPlots(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetPlotsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotsRepository.getAllByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(PlotsRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

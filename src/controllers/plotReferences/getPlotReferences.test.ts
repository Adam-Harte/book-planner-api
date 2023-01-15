import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockPlotReference } from '../../mockData/plotReferences';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import {
  getPlotReferencesRepository,
  PlotReferencesRepository,
} from '../../repositories/plotReferences';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import {
  getPlotReferences,
  GetPlotReferencesReqQuery,
} from './getPlotReferences';

describe('getPlotReferences', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let plotReferencesRepository: any;
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
    plotReferencesRepository = getPlotReferencesRepository(testDataSource);
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

  it('should get all plot references belonging to the user and a series', async () => {
    const fakePlotRef1 = generateMockPlotReference(series);
    const fakePlotRef2 = generateMockPlotReference(series);

    const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
    await plotReferencesRepository.save(plotRef1);

    const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
    await plotReferencesRepository.save(plotRef2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getPlotReferences(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetPlotReferencesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      PlotReferencesRepository.getAllByUserIdAndSeriesId
    ).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
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

  it('should get all plot references belonging to the user and a book', async () => {
    const fakePlotRef1 = generateMockPlotReference({}, book);
    const fakePlotRef2 = generateMockPlotReference({}, book);

    const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
    await plotReferencesRepository.save(plotRef1);

    const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
    await plotReferencesRepository.save(plotRef2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getPlotReferences(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetPlotReferencesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      PlotReferencesRepository.getAllByUserIdAndBookId
    ).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakePlotRef1 = generateMockPlotReference(series);
    const fakePlotRef2 = generateMockPlotReference(series);

    const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
    await plotReferencesRepository.save(plotRef1);

    const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
    await plotReferencesRepository.save(plotRef2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getPlotReferences(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetPlotReferencesReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      PlotReferencesRepository.getAllByUserIdAndSeriesId
    ).not.toHaveBeenCalled();
    expect(
      PlotReferencesRepository.getAllByUserIdAndBookId
    ).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

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
  updatePlotReferenceById,
  UpdatePlotReferenceReqBody,
  UpdatePlotReferenceReqParams,
  UpdatePlotReferenceReqQuery,
} from './updatePlotReferenceById';

describe('updatePlotReferenceById', () => {
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
    PlotReferencesRepository.save = jest
      .fn()
      .mockImplementation((plotRef: any) =>
        plotReferencesRepository.save(plotRef)
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
    const fakePlotRef = generateMockPlotReference(series, book);
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const req = getMockReq({
      params: {
        plotReferenceId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updatePlotReferenceById(
      req as unknown as Request<
        UpdatePlotReferenceReqParams,
        unknown,
        UpdatePlotReferenceReqBody,
        UpdatePlotReferenceReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotReferencesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a plot reference is not fetched by a series or book id', async () => {
    const fakePlotRef = generateMockPlotReference(series, book);
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const req = getMockReq({
      params: {
        plotReferenceId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updatePlotReferenceById(
      req as unknown as Request<
        UpdatePlotReferenceReqParams,
        unknown,
        UpdatePlotReferenceReqBody,
        UpdatePlotReferenceReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotReferencesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a plot reference by a specific id and series id', async () => {
    const fakePlotRef = generateMockPlotReference(series);
    const updatedFakePlotRef = generateMockPlotReference();
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const req = getMockReq({
      params: {
        plotReferenceId: '1',
      },
      query: {
        seriesId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakePlotRef,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updatePlotReferenceById(
      req as unknown as Request<
        UpdatePlotReferenceReqParams,
        unknown,
        UpdatePlotReferenceReqBody,
        UpdatePlotReferenceReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotReferencesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakePlotRef)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot Reference updated.',
      data: {
        id: 1,
        name: updatedFakePlotRef.name,
        type: updatedFakePlotRef.type,
        referenceId: updatedFakePlotRef.referenceId,
      },
    });
  });

  it('should update a plot reference by a specific id and book id', async () => {
    const fakePlotRef = generateMockPlotReference({}, book);
    const updatedFakePlotRef = generateMockPlotReference();
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const req = getMockReq({
      params: {
        plotReferenceId: '1',
      },
      query: {
        bookId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakePlotRef,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updatePlotReferenceById(
      req as unknown as Request<
        UpdatePlotReferenceReqParams,
        unknown,
        UpdatePlotReferenceReqBody,
        UpdatePlotReferenceReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotReferencesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakePlotRef)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot Reference updated.',
      data: {
        id: 1,
        name: updatedFakePlotRef.name,
        type: updatedFakePlotRef.type,
        referenceId: updatedFakePlotRef.referenceId,
      },
    });
  });
});

import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockPlotReference } from '../../mockData/plotReferences';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getPlotReferencesRepository,
  PlotReferencesRepository,
} from '../../repositories/plotReferences';
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
  createPlotReference,
  CreatePlotReferenceReqBody,
  CreatePlotReferenceReqQuery,
} from './createPlotReference';

describe('createPlotReference', () => {
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
    const fakePlotRef = generateMockPlotReference();
    const req = getMockReq({
      body: {
        name: fakePlotRef.name,
        type: fakePlotRef.type,
        referenceId: fakePlotRef.referenceId,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createPlotReference(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreatePlotReferenceReqBody,
        CreatePlotReferenceReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotReferencesRepository.create).not.toHaveBeenCalled();
    expect(PlotReferencesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new Plot Reference belonging to a series', async () => {
    const fakePlotRef = generateMockPlotReference();
    const req = getMockReq({
      body: {
        name: fakePlotRef.name,
        type: fakePlotRef.type,
        referenceId: fakePlotRef.referenceId,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createPlotReference(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreatePlotReferenceReqBody,
        CreatePlotReferenceReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotReferencesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      type: req.body.type,
      referenceId: req.body.referenceId,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(PlotReferencesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        type: req.body.type,
        referenceId: req.body.referenceId,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot Reference created.',
      data: {
        id: 1,
        name: fakePlotRef.name,
        type: fakePlotRef.type,
        referenceId: fakePlotRef.referenceId,
      },
    });
  });

  it('should create a new Plot Reference belonging to a book', async () => {
    const fakePlotRef = generateMockPlotReference();
    const req = getMockReq({
      body: {
        name: fakePlotRef.name,
        type: fakePlotRef.type,
        referenceId: fakePlotRef.referenceId,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createPlotReference(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreatePlotReferenceReqBody,
        CreatePlotReferenceReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotReferencesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      type: req.body.type,
      referenceId: req.body.referenceId,
      book: expect.objectContaining({
        id: 1,
        name: fakeBook.name,
        genre: fakeBook.genre,
      }),
    });
    expect(PlotReferencesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        type: req.body.type,
        referenceId: req.body.referenceId,
        book: expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Plot Reference created.',
      data: {
        id: 1,
        name: fakePlotRef.name,
        type: fakePlotRef.type,
        referenceId: fakePlotRef.referenceId,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the plot reference', async () => {
    const fakePlotRef = generateMockPlotReference();
    const req = getMockReq({
      body: {
        name: fakePlotRef.name,
        type: fakePlotRef.type,
        referenceId: fakePlotRef.referenceId,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createPlotReference(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreatePlotReferenceReqBody,
        CreatePlotReferenceReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(PlotReferencesRepository.create).not.toHaveBeenCalled();
    expect(PlotReferencesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A plot reference must be created belonging to one of your series or books.',
    });
  });
});

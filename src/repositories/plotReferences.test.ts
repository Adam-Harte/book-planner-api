import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockPlotReference } from '../mockData/plotReferences';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getPlotReferencesRepository } from './plotReferences';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('PlotReferences repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let plotReferencesRepository: any;
  let usersRepository: any;
  let seriesRepository: any;
  let fakeUser: any;
  let user: any;
  let fakeSeries: any;
  let series: any;
  let fakeBook: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    booksRepository = getBooksRepository(testDataSource);
    plotReferencesRepository = getPlotReferencesRepository(testDataSource);
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
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

  it('returns all plot references found with matching user id and series id', async () => {
    const fakePlotRef1 = generateMockPlotReference(series);
    const fakePlotRef2 = generateMockPlotReference(series);

    const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
    await plotReferencesRepository.save(plotRef1);
    const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
    await plotReferencesRepository.save(plotRef2);

    const result = await plotReferencesRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    const {
      id: plotRef1id,
      name: plotRef1Name,
      type: plotRef1Type,
      referenceId: plotRef1RefId,
    } = plotRef1;
    const {
      id: plotRef2id,
      name: plotRef2Name,
      type: plotRef2Type,
      referenceId: plotRef2RefId,
    } = plotRef2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: plotRef1id,
          name: plotRef1Name,
          type: plotRef1Type,
          referenceId: plotRef1RefId,
        }),
        expect.objectContaining({
          id: plotRef2id,
          name: plotRef2Name,
          type: plotRef2Type,
          referenceId: plotRef2RefId,
        }),
      ])
    );
  });

  it('returns empty array if no plot references found by matching user id and series id', async () => {
    const fakePlotRef1 = generateMockPlotReference(series);
    const fakePlotRef2 = generateMockPlotReference(series);

    const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
    await plotReferencesRepository.save(plotRef1);
    const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
    await plotReferencesRepository.save(plotRef2);

    const result = await plotReferencesRepository.getAllByUserIdAndSeriesId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns all plot references found with matching user id and book id', async () => {
    const fakePlotRef1 = generateMockPlotReference({}, book);
    const fakePlotRef2 = generateMockPlotReference({}, book);

    const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
    await plotReferencesRepository.save(plotRef1);
    const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
    await plotReferencesRepository.save(plotRef2);

    const result = await plotReferencesRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    const {
      id: plotRef1id,
      name: plotRef1Name,
      type: plotRef1Type,
      referenceId: plotRef1RefId,
    } = plotRef1;
    const {
      id: plotRef2id,
      name: plotRef2Name,
      type: plotRef2Type,
      referenceId: plotRef2RefId,
    } = plotRef2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: plotRef1id,
          name: plotRef1Name,
          type: plotRef1Type,
          referenceId: plotRef1RefId,
        }),
        expect.objectContaining({
          id: plotRef2id,
          name: plotRef2Name,
          type: plotRef2Type,
          referenceId: plotRef2RefId,
        }),
      ])
    );
  });

  it('returns empty array if no plot references found by matching user id and book id', async () => {
    const fakePlotRef1 = generateMockPlotReference({}, book);
    const fakePlotRef2 = generateMockPlotReference({}, book);

    const plotRef1 = await plotReferencesRepository.create(fakePlotRef1);
    await plotReferencesRepository.save(plotRef1);
    const plotRef2 = await plotReferencesRepository.create(fakePlotRef2);
    await plotReferencesRepository.save(plotRef2);

    const result = await plotReferencesRepository.getAllByUserIdAndBookId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns a plot reference found with a specific user id and series id', async () => {
    const fakePlotRef = generateMockPlotReference(series);
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const result = await plotReferencesRepository.getByUserIdAndSeriesId(
      plotRef.id,
      user.id,
      series.id
    );

    const {
      id: plotRefId,
      name: plotRefName,
      type: plotRefType,
      referenceId: plotRefRefId,
    } = plotRef;

    expect(result).toEqual(
      expect.objectContaining({
        id: plotRefId,
        name: plotRefName,
        type: plotRefType,
        referenceId: plotRefRefId,
      })
    );
  });

  it('returns a plot reference found with a specific user id and series id and its relations', async () => {
    const fakePlotRef = generateMockPlotReference(series);
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const result = await plotReferencesRepository.getByUserIdAndSeriesId(
      plotRef.id,
      user.id,
      series.id,
      true
    );

    const {
      id: plotRefId,
      name: plotRefName,
      type: plotRefType,
      referenceId: plotRefRefId,
    } = plotRef;

    expect(result).toEqual(
      expect.objectContaining({
        id: plotRefId,
        name: plotRefName,
        type: plotRefType,
        referenceId: plotRefRefId,
        book: null,
        series: expect.objectContaining({
          id: series.id,
          name: series.name,
          genre: series.genre,
        }),
        plots: [],
      })
    );
  });

  it('returns null if no plot reference found by a specific user id and series id', async () => {
    const fakePlotRef = generateMockPlotReference(series);
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const result = await plotReferencesRepository.getByUserIdAndSeriesId(
      plotRef.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a plot reference found with a specific user id and book id', async () => {
    const fakePlotRef = generateMockPlotReference({}, book);
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const result = await plotReferencesRepository.getByUserIdAndBookId(
      plotRef.id,
      user.id,
      book.id
    );

    const {
      id: plotRefId,
      name: plotRefName,
      type: plotRefType,
      referenceId: plotRefRefId,
    } = plotRef;

    expect(result).toEqual(
      expect.objectContaining({
        id: plotRefId,
        name: plotRefName,
        type: plotRefType,
        referenceId: plotRefRefId,
      })
    );
  });

  it('returns a plot reference found with a specific user id and book id and its relations', async () => {
    const fakePlotRef = generateMockPlotReference({}, book);
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const result = await plotReferencesRepository.getByUserIdAndBookId(
      plotRef.id,
      user.id,
      book.id,
      true
    );

    const {
      id: plotRefId,
      name: plotRefName,
      type: plotRefType,
      referenceId: plotRefRefId,
    } = plotRef;

    expect(result).toEqual(
      expect.objectContaining({
        id: plotRefId,
        name: plotRefName,
        type: plotRefType,
        referenceId: plotRefRefId,
        book: expect.objectContaining({
          id: book.id,
          name: book.name,
          genre: book.genre,
        }),
        series: null,
        plots: [],
      })
    );
  });

  it('returns null if no plot reference found by a specific user id and book id', async () => {
    const fakePlotRef = generateMockPlotReference({}, book);
    const plotRef = await plotReferencesRepository.create(fakePlotRef);
    await plotReferencesRepository.save(plotRef);

    const result = await plotReferencesRepository.getByUserIdAndBookId(
      plotRef.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

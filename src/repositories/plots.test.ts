import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockPlot } from '../mockData/plots';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getPlotsRepository } from './plots';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('Plots repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let plotsRepository: any;
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
    plotsRepository = getPlotsRepository(testDataSource);
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

  it('returns all plots found with matching user id and series id', async () => {
    const fakePlot1 = generateMockPlot(series);
    const fakePlot2 = generateMockPlot(series);

    const plot1 = await plotsRepository.create(fakePlot1);
    await plotsRepository.save(plot1);
    const plot2 = await plotsRepository.create(fakePlot2);
    await plotsRepository.save(plot2);

    const result = await plotsRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    const {
      id: plot1id,
      name: plot1Name,
      type: plot1Type,
      description: plot1Description,
    } = plot1;
    const {
      id: plot2id,
      name: plot2Name,
      type: plot2Type,
      description: plot2Description,
    } = plot2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: plot1id,
          name: plot1Name,
          type: plot1Type,
          description: plot1Description,
        }),
        expect.objectContaining({
          id: plot2id,
          name: plot2Name,
          type: plot2Type,
          description: plot2Description,
        }),
      ])
    );
  });

  it('returns empty array if no plots found by matching user id and series id', async () => {
    const fakePlot1 = generateMockPlot(series);
    const fakePlot2 = generateMockPlot(series);

    const plot1 = await plotsRepository.create(fakePlot1);
    await plotsRepository.save(plot1);
    const plot2 = await plotsRepository.create(fakePlot2);
    await plotsRepository.save(plot2);

    const result = await plotsRepository.getAllByUserIdAndSeriesId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns all plots found with matching user id and book id', async () => {
    const fakePlot1 = generateMockPlot({}, book);
    const fakePlot2 = generateMockPlot({}, book);

    const plot1 = await plotsRepository.create(fakePlot1);
    await plotsRepository.save(plot1);
    const plot2 = await plotsRepository.create(fakePlot2);
    await plotsRepository.save(plot2);

    const result = await plotsRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    const {
      id: plot1id,
      name: plot1Name,
      type: plot1Type,
      description: plot1Description,
    } = plot1;
    const {
      id: plot2id,
      name: plot2Name,
      type: plot2Type,
      description: plot2Description,
    } = plot2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: plot1id,
          name: plot1Name,
          type: plot1Type,
          description: plot1Description,
        }),
        expect.objectContaining({
          id: plot2id,
          name: plot2Name,
          type: plot2Type,
          description: plot2Description,
        }),
      ])
    );
  });

  it('returns empty array if no plots found by matching user id and book id', async () => {
    const fakePlot1 = generateMockPlot({}, book);
    const fakePlot2 = generateMockPlot({}, book);

    const plot1 = await plotsRepository.create(fakePlot1);
    await plotsRepository.save(plot1);
    const plot2 = await plotsRepository.create(fakePlot2);
    await plotsRepository.save(plot2);

    const result = await plotsRepository.getAllByUserIdAndSeriesId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns a plot found with a specific user id and series id', async () => {
    const fakePlot = generateMockPlot(series);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const result = await plotsRepository.getByUserIdAndSeriesId(
      plot.id,
      user.id,
      series.id
    );

    const {
      id: plotId,
      name: plotName,
      type: plotType,
      description: plotDescription,
    } = plot;

    expect(result).toEqual(
      expect.objectContaining({
        id: plotId,
        name: plotName,
        type: plotType,
        description: plotDescription,
      })
    );
  });

  it('returns a plot found with a specific user id and series id and its relations', async () => {
    const fakePlot = generateMockPlot(series);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const result = await plotsRepository.getByUserIdAndSeriesId(
      plot.id,
      user.id,
      series.id,
      true
    );

    const {
      id: plotId,
      name: plotName,
      type: plotType,
      description: plotDescription,
    } = plot;

    expect(result).toEqual(
      expect.objectContaining({
        id: plotId,
        name: plotName,
        type: plotType,
        description: plotDescription,
        book: null,
        series: expect.objectContaining({
          id: series.id,
          name: series.name,
          genre: series.genre,
        }),
        settings: [],
        characters: [],
        plotReferences: [],
      })
    );
  });

  it('returns null if no plot found by a specific user id and series id', async () => {
    const fakePlot = generateMockPlot(series);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const result = await plotsRepository.getByUserIdAndSeriesId(
      plot.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a plot found with a specific user id and book id', async () => {
    const fakePlot = generateMockPlot({}, book);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const result = await plotsRepository.getByUserIdAndBookId(
      plot.id,
      user.id,
      book.id
    );

    const {
      id: plotId,
      name: plotName,
      type: plotType,
      description: plotDescription,
    } = plot;

    expect(result).toEqual(
      expect.objectContaining({
        id: plotId,
        name: plotName,
        type: plotType,
        description: plotDescription,
      })
    );
  });

  it('returns a plot found with a specific user id and book id and its relations', async () => {
    const fakePlot = generateMockPlot({}, book);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const result = await plotsRepository.getByUserIdAndBookId(
      plot.id,
      user.id,
      book.id,
      true
    );

    const {
      id: plotId,
      name: plotName,
      type: plotType,
      description: plotDescription,
    } = plot;

    expect(result).toEqual(
      expect.objectContaining({
        id: plotId,
        name: plotName,
        type: plotType,
        description: plotDescription,
        book: expect.objectContaining({
          id: book.id,
          name: book.name,
          genre: book.genre,
        }),
        series: null,
        settings: [],
        characters: [],
        plotReferences: [],
      })
    );
  });

  it('returns null if no plot found by a specific user id and book id', async () => {
    const fakePlot = generateMockPlot(series);
    const plot = await plotsRepository.create(fakePlot);
    await plotsRepository.save(plot);

    const result = await plotsRepository.getByUserIdAndSeriesId(
      plot.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

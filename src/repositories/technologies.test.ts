import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockTechnology } from '../mockData/technologies';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getSeriesRepository } from './series';
import { getTechnologiesRepository } from './technologies';
import { getUsersRepository } from './users';

describe('Technologies repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let technologiesRepository: any;
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
    technologiesRepository = getTechnologiesRepository(testDataSource);
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

  it('returns all technologies found with matching user id and series id', async () => {
    const fakeTechnology1 = generateMockTechnology(series);
    const fakeTechnology2 = generateMockTechnology(series);

    const technology1 = await technologiesRepository.create(fakeTechnology1);
    await technologiesRepository.save(technology1);
    const technology2 = await technologiesRepository.create(fakeTechnology2);
    await technologiesRepository.save(technology2);

    const result = await technologiesRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: technology1.id,
          name: technology1.name,
          description: technology1.description,
          inventor: technology1.inventor,
        }),
        expect.objectContaining({
          id: technology2.id,
          name: technology2.name,
          description: technology2.description,
          inventor: technology2.inventor,
        }),
      ])
    );
  });

  it('returns empty array if no technologies found by matching user id and series id', async () => {
    const fakeTechnology1 = generateMockTechnology(series);
    const fakeTechnology2 = generateMockTechnology(series);

    const technology1 = await technologiesRepository.create(fakeTechnology1);
    await technologiesRepository.save(technology1);
    const technology2 = await technologiesRepository.create(fakeTechnology2);
    await technologiesRepository.save(technology2);

    const result = await technologiesRepository.getAllByUserIdAndSeriesId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns all technologies found with matching user id and book id', async () => {
    const fakeTechnology1 = generateMockTechnology({}, [book]);
    const fakeTechnology2 = generateMockTechnology({}, [book]);

    const technology1 = await technologiesRepository.create(fakeTechnology1);
    await technologiesRepository.save(technology1);
    const technology2 = await technologiesRepository.create(fakeTechnology2);
    await technologiesRepository.save(technology2);

    const result = await technologiesRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: technology1.id,
          name: technology1.name,
          description: technology1.description,
          inventor: technology1.inventor,
        }),
        expect.objectContaining({
          id: technology2.id,
          name: technology2.name,
          description: technology2.description,
          inventor: technology2.inventor,
        }),
      ])
    );
  });

  it('returns empty array if no technologies found by matching user id and book id', async () => {
    const fakeTechnology1 = generateMockTechnology({}, [book]);
    const fakeTechnology2 = generateMockTechnology({}, [book]);

    const technology1 = await technologiesRepository.create(fakeTechnology1);
    await technologiesRepository.save(technology1);
    const technology2 = await technologiesRepository.create(fakeTechnology2);
    await technologiesRepository.save(technology2);

    const result = await technologiesRepository.getAllByUserIdAndBookId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns a technology found with a specific user id and series id', async () => {
    const fakeTechnology = generateMockTechnology(series);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const result = await technologiesRepository.getByUserIdAndSeriesId(
      technology.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: technology.id,
        name: technology.name,
        description: technology.description,
        inventor: technology.inventor,
      })
    );
  });

  it('returns a technology found with a specific user id and series id and its relations', async () => {
    const fakeTechnology = generateMockTechnology(series);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const result = await technologiesRepository.getByUserIdAndSeriesId(
      technology.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: technology.id,
        name: technology.name,
        description: technology.description,
        inventor: technology.inventor,
        books: [],
        setting: null,
        series: expect.objectContaining({
          id: series.id,
          name: series.name,
          genre: series.genre,
        }),
      })
    );
  });

  it('returns null if no technology found by a specific user id and series id', async () => {
    const fakeTechnology = generateMockTechnology(series);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const result = await technologiesRepository.getByUserIdAndSeriesId(
      technology.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a technology found with a specific user id and book id', async () => {
    const fakeTechnology = generateMockTechnology({}, [book]);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const result = await technologiesRepository.getByUserIdAndBookId(
      technology.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: technology.id,
        name: technology.name,
        description: technology.description,
        inventor: technology.inventor,
      })
    );
  });

  it('returns a technology found with a specific user id and book id and its relations', async () => {
    const fakeTechnology = generateMockTechnology({}, [book]);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const result = await technologiesRepository.getByUserIdAndBookId(
      technology.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: technology.id,
        name: technology.name,
        description: technology.description,
        inventor: technology.inventor,
        books: [
          expect.objectContaining({
            id: book.id,
            name: book.name,
            genre: book.genre,
          }),
        ],
        series: null,
        setting: null,
      })
    );
  });

  it('returns null if no technology found by a specific user id and book id', async () => {
    const fakeTechnology = generateMockTechnology({}, [book]);
    const technology = await technologiesRepository.create(fakeTechnology);
    await technologiesRepository.save(technology);

    const result = await technologiesRepository.getByUserIdAndBookId(
      technology.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

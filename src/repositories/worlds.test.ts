import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import { generateMockWorld } from '../mockData/worlds';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';
import { getWorldsRepository } from './worlds';

describe('Worlds repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let worldsRepository: any;
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
    worldsRepository = getWorldsRepository(testDataSource);
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

  it('returns all worlds found with matching user id and series id', async () => {
    const fakeWorld1 = generateMockWorld(series);
    const fakeWorld2 = generateMockWorld(series);

    const world1 = await worldsRepository.create(fakeWorld1);
    await worldsRepository.save(world1);
    const world2 = await worldsRepository.create(fakeWorld2);
    await worldsRepository.save(world2);

    const result = await worldsRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: world1.id,
          name: world1.name,
          description: world1.description,
        }),
        expect.objectContaining({
          id: world2.id,
          name: world2.name,
          description: world2.description,
        }),
      ])
    );
  });

  it('returns empty array if no worlds found by matching user id and series id', async () => {
    const fakeWorld1 = generateMockWorld(series);
    const fakeWorld2 = generateMockWorld(series);

    const world1 = await worldsRepository.create(fakeWorld1);
    await worldsRepository.save(world1);
    const world2 = await worldsRepository.create(fakeWorld2);
    await worldsRepository.save(world2);

    const result = await worldsRepository.getAllByUserIdAndSeriesId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns all worlds found with matching user id and book id', async () => {
    const fakeWorld1 = generateMockWorld({}, [book]);
    const fakeWorld2 = generateMockWorld({}, [book]);

    const world1 = await worldsRepository.create(fakeWorld1);
    await worldsRepository.save(world1);
    const world2 = await worldsRepository.create(fakeWorld2);
    await worldsRepository.save(world2);

    const result = await worldsRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: world1.id,
          name: world1.name,
          description: world1.description,
        }),
        expect.objectContaining({
          id: world2.id,
          name: world2.name,
          description: world2.description,
        }),
      ])
    );
  });

  it('returns empty array if no worlds found by matching user id and book id', async () => {
    const fakeWorld1 = generateMockWorld({}, [book]);
    const fakeWorld2 = generateMockWorld({}, [book]);

    const world1 = await worldsRepository.create(fakeWorld1);
    await worldsRepository.save(world1);
    const world2 = await worldsRepository.create(fakeWorld2);
    await worldsRepository.save(world2);

    const result = await worldsRepository.getAllByUserIdAndBookId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns a world found with a specific user id and series id', async () => {
    const fakeWorld = generateMockWorld(series);
    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const result = await worldsRepository.getByUserIdAndSeriesId(
      world.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: world.id,
        name: world.name,
        description: world.description,
      })
    );
  });

  it('returns a world found with a specific user id and series id and its relations', async () => {
    const fakeWorld = generateMockWorld(series);
    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const result = await worldsRepository.getByUserIdAndSeriesId(
      world.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: world.id,
        name: world.name,
        description: world.description,
        books: [],
        series: expect.objectContaining({
          id: series.id,
          name: series.name,
          genre: series.genre,
        }),
        settings: [],
      })
    );
  });

  it('returns null if no world found by a specific user id and series id', async () => {
    const fakeWorld = generateMockWorld(series);
    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const result = await worldsRepository.getByUserIdAndSeriesId(
      world.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a world found with a specific user id and book id', async () => {
    const fakeWorld = generateMockWorld({}, [book]);
    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const result = await worldsRepository.getByUserIdAndBookId(
      world.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: world.id,
        name: world.name,
        description: world.description,
      })
    );
  });

  it('returns a world found with a specific user id and book id and its relations', async () => {
    const fakeWorld = generateMockWorld({}, [book]);
    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const result = await worldsRepository.getByUserIdAndBookId(
      world.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: world.id,
        name: world.name,
        description: world.description,
        books: [
          expect.objectContaining({
            id: book.id,
            name: book.name,
            genre: book.genre,
          }),
        ],
        series: null,
        settings: [],
      })
    );
  });

  it('returns null if no world found by a specific user id and book id', async () => {
    const fakeWorld = generateMockWorld({}, [book]);
    const world = await worldsRepository.create(fakeWorld);
    await worldsRepository.save(world);

    const result = await worldsRepository.getByUserIdAndBookId(
      world.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

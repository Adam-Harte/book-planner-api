import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockMagicSystem } from '../mockData/magicSystems';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getMagicSystemsRepository } from './magicSystems';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('MagicSystems repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let magicSystemsRepository: any;
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
    magicSystemsRepository = getMagicSystemsRepository(testDataSource);
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

  it('returns all magic systems found with matching user id and series id', async () => {
    const fakeMagicSystem1 = generateMockMagicSystem(series);
    const fakeMagicSystem2 = generateMockMagicSystem(series);

    const magicSystem1 = await magicSystemsRepository.create(fakeMagicSystem1);
    await magicSystemsRepository.save(magicSystem1);
    const magicSystem2 = await magicSystemsRepository.create(fakeMagicSystem2);
    await magicSystemsRepository.save(magicSystem2);

    const result = await magicSystemsRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: magicSystem1.id,
          name: magicSystem1.name,
          description: magicSystem1.description,
          rules: magicSystem1.rules,
        }),
        expect.objectContaining({
          id: magicSystem2.id,
          name: magicSystem2.name,
          description: magicSystem2.description,
          rules: magicSystem2.rules,
        }),
      ])
    );
  });

  it('returns empty array if no magic systems found by matching user id and series id', async () => {
    const fakeMagicSystem1 = generateMockMagicSystem(series);
    const fakeMagicSystem2 = generateMockMagicSystem(series);

    const magicSystem1 = await magicSystemsRepository.create(fakeMagicSystem1);
    await magicSystemsRepository.save(magicSystem1);
    const magicSystem2 = await magicSystemsRepository.create(fakeMagicSystem2);
    await magicSystemsRepository.save(magicSystem2);

    const result = await magicSystemsRepository.getAllByUserIdAndSeriesId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns all magic systems found with matching user id and book id', async () => {
    const fakeMagicSystem1 = generateMockMagicSystem({}, [book]);
    const fakeMagicSystem2 = generateMockMagicSystem({}, [book]);

    const magicSystem1 = await magicSystemsRepository.create(fakeMagicSystem1);
    await magicSystemsRepository.save(magicSystem1);
    const magicSystem2 = await magicSystemsRepository.create(fakeMagicSystem2);
    await magicSystemsRepository.save(magicSystem2);

    const result = await magicSystemsRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: magicSystem1.id,
          name: magicSystem1.name,
          description: magicSystem1.description,
          rules: magicSystem1.rules,
        }),
        expect.objectContaining({
          id: magicSystem2.id,
          name: magicSystem2.name,
          description: magicSystem2.description,
          rules: magicSystem2.rules,
        }),
      ])
    );
  });

  it('returns empty array if no magic systems found by matching user id and book id', async () => {
    const fakeMagicSystem1 = generateMockMagicSystem({}, [book]);
    const fakeMagicSystem2 = generateMockMagicSystem({}, [book]);

    const magicSystem1 = await magicSystemsRepository.create(fakeMagicSystem1);
    await magicSystemsRepository.save(magicSystem1);
    const magicSystem2 = await magicSystemsRepository.create(fakeMagicSystem2);
    await magicSystemsRepository.save(magicSystem2);

    const result = await magicSystemsRepository.getAllByUserIdAndBookId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns a magic system found with a specific user id and series id', async () => {
    const fakeMagicSystem = generateMockMagicSystem(series);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const result = await magicSystemsRepository.getByUserIdAndSeriesId(
      magicSystem.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: magicSystem.id,
        name: magicSystem.name,
        description: magicSystem.description,
        rules: magicSystem.rules,
      })
    );
  });

  it('returns a magic system found with a specific user id and series id and its relations', async () => {
    const fakeMagicSystem = generateMockMagicSystem(series);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const result = await magicSystemsRepository.getByUserIdAndSeriesId(
      magicSystem.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: magicSystem.id,
        name: magicSystem.name,
        description: magicSystem.description,
        rules: magicSystem.rules,
        books: [],
        series: expect.objectContaining({
          id: series.id,
          name: series.name,
          genre: series.genre,
        }),
      })
    );
  });

  it('returns null if no magic system found by a specific user id and series id', async () => {
    const fakeMagicSystem = generateMockMagicSystem(series);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const result = await magicSystemsRepository.getByUserIdAndSeriesId(
      magicSystem.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a magic system found with a specific user id and book id', async () => {
    const fakeMagicSystem = generateMockMagicSystem({}, [book]);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const result = await magicSystemsRepository.getByUserIdAndBookId(
      magicSystem.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: magicSystem.id,
        name: magicSystem.name,
        description: magicSystem.description,
        rules: magicSystem.rules,
      })
    );
  });

  it('returns a magic system found with a specific user id and book id and its relations', async () => {
    const fakeMagicSystem = generateMockMagicSystem({}, [book]);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const result = await magicSystemsRepository.getByUserIdAndBookId(
      magicSystem.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: magicSystem.id,
        name: magicSystem.name,
        description: magicSystem.description,
        rules: magicSystem.rules,
        books: [
          expect.objectContaining({
            id: book.id,
            name: book.name,
            genre: book.genre,
          }),
        ],
        series: null,
      })
    );
  });

  it('returns null if no magic system found by a specific user id and book id', async () => {
    const fakeMagicSystem = generateMockMagicSystem({}, [book]);
    const magicSystem = await magicSystemsRepository.create(fakeMagicSystem);
    await magicSystemsRepository.save(magicSystem);

    const result = await magicSystemsRepository.getByUserIdAndBookId(
      magicSystem.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

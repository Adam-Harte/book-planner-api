import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('Books repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let usersRepository: any;
  let seriesRepository: any;
  let fakeUser: any;
  let user: any;
  let fakeSeries: any;
  let series: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    booksRepository = getBooksRepository(testDataSource);
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
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('returns all books found with matching user id', async () => {
    const fakeBook1 = generateMockBook(user);
    const fakeBook2 = generateMockBook(user);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const result = await booksRepository.getAllByUserId(user.id);

    const { id: book1id, name: book1name, genre: book1genre } = book1;
    const { id: book2id, name: book2name, genre: book2genre } = book2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: book1id,
          name: book1name,
          genre: book1genre,
        }),
        expect.objectContaining({
          id: book2id,
          name: book2name,
          genre: book2genre,
        }),
      ])
    );
  });

  it('returns empty array if no books found by matching user id', async () => {
    const fakeBook1 = generateMockBook(user);
    const fakeBook2 = generateMockBook(user);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const result = await booksRepository.getAllByUserId(2);

    expect(result).toEqual([]);
  });

  it('returns all books found with matching user id and series id', async () => {
    const fakeBook1 = generateMockBook(user, series);
    const fakeBook2 = generateMockBook(user, series);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const result = await booksRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    const { id: book1id, name: book1name, genre: book1genre } = book1;
    const { id: book2id, name: book2name, genre: book2genre } = book2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: book1id,
          name: book1name,
          genre: book1genre,
        }),
        expect.objectContaining({
          id: book2id,
          name: book2name,
          genre: book2genre,
        }),
      ])
    );
  });

  it('returns empty array if no books found by matching user id and series id', async () => {
    const fakeBook1 = generateMockBook(user, series);
    const fakeBook2 = generateMockBook(user, series);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const result = await booksRepository.getAllByUserIdAndSeriesId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns a book found with a specific user id and book id', async () => {
    const fakeBook = generateMockBook(user);
    const book = await booksRepository.create(fakeBook);
    await booksRepository.save(book);

    const result = await booksRepository.getByUserIdAndBookId(user.id, book.id);

    const { id: bookId, name: bookName, genre: bookGenre } = book;

    expect(result).toEqual(
      expect.objectContaining({
        id: bookId,
        name: bookName,
        genre: bookGenre,
      })
    );
  });

  it('returns a book found with a specific user id and book id and its relations', async () => {
    const fakeBook = generateMockBook(user);
    const book = await booksRepository.create(fakeBook);
    await booksRepository.save(book);

    const result = await booksRepository.getByUserIdAndBookId(
      user.id,
      book.id,
      true
    );

    const { id: bookId, name: bookName, genre: bookGenre } = book;

    expect(result).toEqual(
      expect.objectContaining({
        id: bookId,
        name: bookName,
        genre: bookGenre,
        settings: [],
        worlds: [],
        characters: [],
        plots: [],
        magicSystems: [],
        weapons: [],
        technologies: [],
        transports: [],
        battles: [],
        groups: [],
        creatures: [],
        races: [],
        languages: [],
        songs: [],
        families: [],
        governments: [],
        religions: [],
        gods: [],
        artifacts: [],
        legends: [],
        histories: [],
        maps: [],
      })
    );
  });

  it('returns null if no book found by a specific user id and book id', async () => {
    const fakeBook = generateMockBook(user);

    const book = await booksRepository.create(fakeBook);
    await booksRepository.save(book);

    const result = await booksRepository.getByUserIdAndBookId(2, book.id);

    expect(result).toBe(null);
  });
});

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

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    booksRepository = getBooksRepository(testDataSource);
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    dbBackup = testDb.backup();
  });

  beforeEach(() => {
    dbBackup.restore();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
  });

  it('returns all books found with matching user id', async () => {
    const fakeUser = generateMockUser();

    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeBook1 = generateMockBook(savedUser);
    const fakeBook2 = generateMockBook(savedUser);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const result = await booksRepository.getAllByUserId(savedUser.id);

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
    const fakeUser1 = generateMockUser();
    const fakeUser2 = generateMockUser();

    const user1 = await usersRepository.create(fakeUser1);
    await usersRepository.save(user1);

    const user2 = await usersRepository.create(fakeUser2);
    await usersRepository.save(user2);

    const fakeBook1 = generateMockBook(user1);
    const fakeBook2 = generateMockBook(user1);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const result = await booksRepository.getAllByUserId(user2.id);

    expect(result).toEqual([]);
  });

  it('returns all books found with matching user id and series id', async () => {
    const fakeUser = generateMockUser();

    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeSeries = generateMockSeries(savedUser);

    const series = await seriesRepository.create(fakeSeries);
    const savedSeries = await seriesRepository.save(series);

    const fakeBook1 = generateMockBook(savedUser, savedSeries);
    const fakeBook2 = generateMockBook(savedUser, savedSeries);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const result = await booksRepository.getAllByUserIdAndSeriesId(
      savedUser.id,
      savedSeries.id
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
    const fakeUser = generateMockUser();

    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeSeries1 = generateMockSeries(savedUser);
    const fakeSeries2 = generateMockSeries(savedUser);

    const series1 = await seriesRepository.create(fakeSeries1);
    const savedSeries1 = await seriesRepository.save(series1);
    const series2 = await seriesRepository.create(fakeSeries2);
    const savedSeries2 = await seriesRepository.save(series2);

    const fakeBook1 = generateMockBook(savedUser, savedSeries1);
    const fakeBook2 = generateMockBook(savedUser, savedSeries1);

    const book1 = await booksRepository.create(fakeBook1);
    await booksRepository.save(book1);

    const book2 = await booksRepository.create(fakeBook2);
    await booksRepository.save(book2);

    const result = await booksRepository.getAllByUserIdAndSeriesId(
      savedUser.id,
      savedSeries2.id
    );

    expect(result).toEqual([]);
  });

  it('returns a book found with a specific user id and book id', async () => {
    const fakeUser = generateMockUser();

    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);

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
    const fakeUser = generateMockUser();

    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);

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
    const fakeUser1 = generateMockUser();
    const fakeUser2 = generateMockUser();

    const user1 = await usersRepository.create(fakeUser1);
    await usersRepository.save(user1);

    const user2 = await usersRepository.create(fakeUser2);
    await usersRepository.save(user2);

    const fakeBook = generateMockBook(user1);

    const book = await booksRepository.create(fakeBook);
    await booksRepository.save(book);

    const result = await booksRepository.getByUserIdAndBookId(
      user2.id,
      book.id
    );

    expect(result).toBe(null);
  });
});

import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockCharacter } from '../mockData/characters';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getCharactersRepository } from './characters';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('Characters repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let charactersRepository: any;
  let usersRepository: any;
  let seriesRepository: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    booksRepository = getBooksRepository(testDataSource);
    charactersRepository = getCharactersRepository(testDataSource);
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

  it('returns all characters found with matching user id and series id', async () => {
    const fakeUser = generateMockUser();
    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeSeries1 = generateMockSeries(savedUser);
    const series = await seriesRepository.create(fakeSeries1);
    const savedSeries = await seriesRepository.save(series);

    const fakeCharacter1 = generateMockCharacter(savedSeries);
    const fakeCharacter2 = generateMockCharacter(savedSeries);
    const fakeCharacter3 = generateMockCharacter(savedSeries);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);
    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);
    const character3 = await charactersRepository.create(fakeCharacter3);
    await charactersRepository.save(character3);

    const result = await charactersRepository.getAllByUserIdAndSeriesId(
      savedUser.id,
      savedSeries.id
    );

    const {
      id: character1id,
      firstName: character1FirstName,
      lastName: character1LastName,
      title: character1Title,
      type: character1Type,
      age: character1Age,
      physicalDescription: character1PhysicalDescription,
      personalityDescription: character1PersonalityDescription,
    } = character1;
    const {
      id: character2id,
      firstName: character2FirstName,
      lastName: character2LastName,
      title: character2Title,
      type: character2Type,
      age: character2Age,
      physicalDescription: character2PhysicalDescription,
      personalityDescription: character2PersonalityDescription,
    } = character2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: character1id,
          firstName: character1FirstName,
          lastName: character1LastName,
          title: character1Title,
          type: character1Type,
          age: character1Age,
          physicalDescription: character1PhysicalDescription,
          personalityDescription: character1PersonalityDescription,
        }),
        expect.objectContaining({
          id: character2id,
          firstName: character2FirstName,
          lastName: character2LastName,
          title: character2Title,
          type: character2Type,
          age: character2Age,
          physicalDescription: character2PhysicalDescription,
          personalityDescription: character2PersonalityDescription,
        }),
      ])
    );
  });

  it('returns empty array if no characters found by matching user id and series id', async () => {
    const fakeUser = generateMockUser();
    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeSeries1 = generateMockSeries(savedUser);
    const series = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series);

    const fakeCharacter1 = generateMockCharacter();
    const fakeCharacter2 = generateMockCharacter();
    const fakeCharacter3 = generateMockCharacter();

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);
    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);
    const character3 = await charactersRepository.create(fakeCharacter3);
    await charactersRepository.save(character3);

    const result = await charactersRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual([]);
  });

  it('returns all characters found with matching user id and book id', async () => {
    const fakeUser = generateMockUser();
    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeBook = generateMockBook(savedUser);
    const book = await booksRepository.create(fakeBook);
    const savedBook = await booksRepository.save(book);

    const fakeCharacter1 = generateMockCharacter({}, [savedBook]);
    const fakeCharacter2 = generateMockCharacter({}, [savedBook]);
    const fakeCharacter3 = generateMockCharacter({}, []);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);
    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);
    const character3 = await charactersRepository.create(fakeCharacter3);
    await charactersRepository.save(character3);

    const result = await charactersRepository.getAllByUserIdAndBookId(
      savedUser.id,
      savedBook.id
    );

    const {
      id: character1id,
      firstName: character1FirstName,
      lastName: character1LastName,
      title: character1Title,
      type: character1Type,
      age: character1Age,
      physicalDescription: character1PhysicalDescription,
      personalityDescription: character1PersonalityDescription,
    } = character1;
    const {
      id: character2id,
      firstName: character2FirstName,
      lastName: character2LastName,
      title: character2Title,
      type: character2Type,
      age: character2Age,
      physicalDescription: character2PhysicalDescription,
      personalityDescription: character2PersonalityDescription,
    } = character2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: character1id,
          firstName: character1FirstName,
          lastName: character1LastName,
          title: character1Title,
          type: character1Type,
          age: character1Age,
          physicalDescription: character1PhysicalDescription,
          personalityDescription: character1PersonalityDescription,
        }),
        expect.objectContaining({
          id: character2id,
          firstName: character2FirstName,
          lastName: character2LastName,
          title: character2Title,
          type: character2Type,
          age: character2Age,
          physicalDescription: character2PhysicalDescription,
          personalityDescription: character2PersonalityDescription,
        }),
      ])
    );
  });

  it('returns empty array if no characters found by matching user id and book id', async () => {
    const fakeUser = generateMockUser();
    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeBook = generateMockBook(savedUser);
    const book = await booksRepository.create(fakeBook);
    const savedBook = await booksRepository.save(book);

    const fakeCharacter1 = generateMockCharacter({}, []);
    const fakeCharacter2 = generateMockCharacter({}, []);
    const fakeCharacter3 = generateMockCharacter({}, []);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);
    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);
    const character3 = await charactersRepository.create(fakeCharacter3);
    await charactersRepository.save(character3);

    const result = await charactersRepository.getAllByUserIdAndBookId(
      savedUser.id,
      savedBook.id
    );

    expect(result).toEqual([]);
  });

  it('returns a character found with a specific user id and series id', async () => {
    const fakeUser = generateMockUser();
    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeSeries = generateMockSeries(savedUser);
    const series = await seriesRepository.create(fakeSeries);
    const savedSeries = await seriesRepository.save(series);

    const fakeCharacter = generateMockCharacter(savedSeries);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndSeriesId(
      character.id,
      user.id,
      series.id
    );

    const {
      id: character1id,
      firstName: character1FirstName,
      lastName: character1LastName,
      title: character1Title,
      type: character1Type,
      age: character1Age,
      physicalDescription: character1PhysicalDescription,
      personalityDescription: character1PersonalityDescription,
    } = character;

    expect(result).toEqual(
      expect.objectContaining({
        id: character1id,
        firstName: character1FirstName,
        lastName: character1LastName,
        title: character1Title,
        type: character1Type,
        age: character1Age,
        physicalDescription: character1PhysicalDescription,
        personalityDescription: character1PersonalityDescription,
      })
    );
  });

  it('returns a character found with a specific user id and series id and its relations', async () => {
    const fakeUser = generateMockUser();
    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeSeries = generateMockSeries(savedUser);
    const series = await seriesRepository.create(fakeSeries);
    const savedSeries = await seriesRepository.save(series);

    const fakeCharacter = generateMockCharacter(savedSeries);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndSeriesId(
      character.id,
      user.id,
      series.id,
      true
    );

    const {
      id: character1id,
      firstName: character1FirstName,
      lastName: character1LastName,
      title: character1Title,
      type: character1Type,
      age: character1Age,
      physicalDescription: character1PhysicalDescription,
      personalityDescription: character1PersonalityDescription,
    } = character;

    expect(result).toEqual(
      expect.objectContaining({
        id: character1id,
        firstName: character1FirstName,
        lastName: character1LastName,
        title: character1Title,
        type: character1Type,
        age: character1Age,
        physicalDescription: character1PhysicalDescription,
        personalityDescription: character1PersonalityDescription,
        plots: [],
        groups: [],
        races: [],
        family: null,
      })
    );
  });

  it('returns null if no character found by a specific user id and series id', async () => {
    const fakeUser1 = generateMockUser();
    const fakeUser2 = generateMockUser();

    const user1 = await usersRepository.create(fakeUser1);
    await usersRepository.save(user1);

    const user2 = await usersRepository.create(fakeUser2);
    await usersRepository.save(user2);

    const fakeSeries = generateMockSeries(user1);
    const series = await seriesRepository.create(fakeSeries);
    const savedSeries = await seriesRepository.save(series);

    const fakeCharacter = generateMockCharacter(savedSeries);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndSeriesId(
      character.id,
      user2.id,
      series.id
    );

    expect(result).toBe(null);
  });

  it('returns a book found with a specific user id and book id', async () => {
    const fakeUser = generateMockUser();
    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeBook = generateMockBook(savedUser);
    const book = await booksRepository.create(fakeBook);
    const savedBook = await booksRepository.save(book);

    const fakeCharacter = generateMockCharacter({}, [savedBook]);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndBookId(
      character.id,
      user.id,
      book.id
    );

    const {
      id: character1id,
      firstName: character1FirstName,
      lastName: character1LastName,
      title: character1Title,
      type: character1Type,
      age: character1Age,
      physicalDescription: character1PhysicalDescription,
      personalityDescription: character1PersonalityDescription,
    } = character;

    expect(result).toEqual(
      expect.objectContaining({
        id: character1id,
        firstName: character1FirstName,
        lastName: character1LastName,
        title: character1Title,
        type: character1Type,
        age: character1Age,
        physicalDescription: character1PhysicalDescription,
        personalityDescription: character1PersonalityDescription,
      })
    );
  });

  it('returns a character found with a specific user id and book id and its relations', async () => {
    const fakeUser = generateMockUser();
    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeBook = generateMockBook(savedUser);
    const book = await booksRepository.create(fakeBook);
    const savedBook = await booksRepository.save(book);

    const fakeCharacter = generateMockCharacter({}, [savedBook]);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndBookId(
      character.id,
      user.id,
      book.id,
      true
    );

    const {
      id: character1id,
      firstName: character1FirstName,
      lastName: character1LastName,
      title: character1Title,
      type: character1Type,
      age: character1Age,
      physicalDescription: character1PhysicalDescription,
      personalityDescription: character1PersonalityDescription,
    } = character;

    expect(result).toEqual(
      expect.objectContaining({
        id: character1id,
        firstName: character1FirstName,
        lastName: character1LastName,
        title: character1Title,
        type: character1Type,
        age: character1Age,
        physicalDescription: character1PhysicalDescription,
        personalityDescription: character1PersonalityDescription,
        plots: [],
        groups: [],
        races: [],
        family: null,
      })
    );
  });

  it('returns null if no character found by a specific user id and book id', async () => {
    const fakeUser1 = generateMockUser();
    const fakeUser2 = generateMockUser();

    const user1 = await usersRepository.create(fakeUser1);
    await usersRepository.save(user1);

    const user2 = await usersRepository.create(fakeUser2);
    await usersRepository.save(user2);

    const fakeBook = generateMockBook(user1);
    const book = await booksRepository.create(fakeBook);
    const savedBook = await booksRepository.save(book);

    const fakeCharacter = generateMockCharacter({}, [savedBook]);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndBookId(
      character.id,
      user2.id,
      book.id
    );

    expect(result).toBe(null);
  });
});

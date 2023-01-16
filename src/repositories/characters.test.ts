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
  let fakeUser: any;
  let user: any;
  let fakeSeries: any;
  let series: any;
  let fakeBook: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    booksRepository = getBooksRepository(testDataSource);
    charactersRepository = getCharactersRepository(testDataSource);
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

  it('returns all characters found with matching user id and series id', async () => {
    const fakeCharacter1 = generateMockCharacter(series);
    const fakeCharacter2 = generateMockCharacter(series);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);
    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);

    const result = await charactersRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: character1.id,
          firstName: character1.firstName,
          lastName: character1.lastName,
          title: character1.title,
          type: character1.type,
          age: character1.age,
          physicalDescription: character1.physicalDescription,
          personalityDescription: character1.personalityDescription,
        }),
        expect.objectContaining({
          id: character2.id,
          firstName: character2.firstName,
          lastName: character2.lastName,
          title: character2.title,
          type: character2.type,
          age: character2.age,
          physicalDescription: character2.physicalDescription,
          personalityDescription: character2.personalityDescription,
        }),
      ])
    );
  });

  it('returns empty array if no characters found by matching user id and series id', async () => {
    const fakeCharacter1 = generateMockCharacter();
    const fakeCharacter2 = generateMockCharacter();

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);
    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);

    const result = await charactersRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual([]);
  });

  it('returns all characters found with matching user id and book id', async () => {
    const fakeCharacter1 = generateMockCharacter({}, [book]);
    const fakeCharacter2 = generateMockCharacter({}, [book]);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);
    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);

    const result = await charactersRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: character1.id,
          firstName: character1.firstName,
          lastName: character1.lastName,
          title: character1.title,
          type: character1.type,
          age: character1.age,
          physicalDescription: character1.physicalDescription,
          personalityDescription: character1.personalityDescription,
        }),
        expect.objectContaining({
          id: character2.id,
          firstName: character2.firstName,
          lastName: character2.lastName,
          title: character2.title,
          type: character2.type,
          age: character2.age,
          physicalDescription: character2.physicalDescription,
          personalityDescription: character2.personalityDescription,
        }),
      ])
    );
  });

  it('returns empty array if no characters found by matching user id and book id', async () => {
    const fakeCharacter1 = generateMockCharacter({}, []);
    const fakeCharacter2 = generateMockCharacter({}, []);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);
    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);

    const result = await charactersRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual([]);
  });

  it('returns a character found with a specific user id and series id', async () => {
    const fakeCharacter = generateMockCharacter(series);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndSeriesId(
      character.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: character.id,
        firstName: character.firstName,
        lastName: character.lastName,
        title: character.title,
        type: character.type,
        age: character.age,
        physicalDescription: character.physicalDescription,
        personalityDescription: character.personalityDescription,
      })
    );
  });

  it('returns a character found with a specific user id and series id and its relations', async () => {
    const fakeCharacter = generateMockCharacter(series);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndSeriesId(
      character.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: character.id,
        firstName: character.firstName,
        lastName: character.lastName,
        title: character.title,
        type: character.type,
        age: character.age,
        physicalDescription: character.physicalDescription,
        personalityDescription: character.personalityDescription,
        plots: [],
        groups: [],
        races: [],
        family: null,
      })
    );
  });

  it('returns null if no character found by a specific user id and series id', async () => {
    const fakeCharacter = generateMockCharacter(series);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndSeriesId(
      character.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a character found with a specific user id and book id', async () => {
    const fakeCharacter = generateMockCharacter({}, [book]);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndBookId(
      character.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: character.id,
        firstName: character.firstName,
        lastName: character.lastName,
        title: character.title,
        type: character.type,
        age: character.age,
        physicalDescription: character.physicalDescription,
        personalityDescription: character.personalityDescription,
      })
    );
  });

  it('returns a character found with a specific user id and book id and its relations', async () => {
    const fakeCharacter = generateMockCharacter({}, [book]);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndBookId(
      character.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: character.id,
        firstName: character.firstName,
        lastName: character.lastName,
        title: character.title,
        type: character.type,
        age: character.age,
        physicalDescription: character.physicalDescription,
        personalityDescription: character.personalityDescription,
        plots: [],
        groups: [],
        races: [],
        family: null,
      })
    );
  });

  it('returns null if no character found by a specific user id and book id', async () => {
    const fakeCharacter = generateMockCharacter({}, [book]);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const result = await charactersRepository.getByUserIdAndBookId(
      character.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

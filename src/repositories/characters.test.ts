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
    const fakeCharacter = generateMockCharacter(series);
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
    const fakeCharacter = generateMockCharacter({}, [book]);
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

import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import { generateMockWeapon } from '../mockData/weapons';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';
import { getWeaponsRepository } from './weapons';

describe('Weapons repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let weaponsRepository: any;
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
    weaponsRepository = getWeaponsRepository(testDataSource);
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

  it('returns all weapons found with matching user id and series id', async () => {
    const fakeWeapon1 = generateMockWeapon(series);
    const fakeWeapon2 = generateMockWeapon(series);

    const weapon1 = await weaponsRepository.create(fakeWeapon1);
    await weaponsRepository.save(weapon1);
    const weapon2 = await weaponsRepository.create(fakeWeapon2);
    await weaponsRepository.save(weapon2);

    const result = await weaponsRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: weapon1.id,
          name: weapon1.name,
          description: weapon1.description,
          creator: weapon1.creator,
          wielder: weapon1.wielder,
          forged: weapon1.forged,
        }),
        expect.objectContaining({
          id: weapon2.id,
          name: weapon2.name,
          description: weapon2.description,
          creator: weapon2.creator,
          wielder: weapon2.wielder,
          forged: weapon2.forged,
        }),
      ])
    );
  });

  it('returns empty array if no weapons found by matching user id and series id', async () => {
    const fakeWeapon1 = generateMockWeapon(series);
    const fakeWeapon2 = generateMockWeapon(series);

    const weapon1 = await weaponsRepository.create(fakeWeapon1);
    await weaponsRepository.save(weapon1);
    const weapon2 = await weaponsRepository.create(fakeWeapon2);
    await weaponsRepository.save(weapon2);

    const result = await weaponsRepository.getAllByUserIdAndSeriesId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns all weapons found with matching user id and book id', async () => {
    const fakeWeapon1 = generateMockWeapon({}, [book]);
    const fakeWeapon2 = generateMockWeapon({}, [book]);

    const weapon1 = await weaponsRepository.create(fakeWeapon1);
    await weaponsRepository.save(weapon1);
    const weapon2 = await weaponsRepository.create(fakeWeapon2);
    await weaponsRepository.save(weapon2);

    const result = await weaponsRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: weapon1.id,
          name: weapon1.name,
          description: weapon1.description,
          creator: weapon1.creator,
          wielder: weapon1.wielder,
          forged: weapon1.forged,
        }),
        expect.objectContaining({
          id: weapon2.id,
          name: weapon2.name,
          description: weapon2.description,
          creator: weapon2.creator,
          wielder: weapon2.wielder,
          forged: weapon2.forged,
        }),
      ])
    );
  });

  it('returns empty array if no weapons found by matching user id and book id', async () => {
    const fakeWeapon1 = generateMockWeapon({}, [book]);
    const fakeWeapon2 = generateMockWeapon({}, [book]);

    const weapon1 = await weaponsRepository.create(fakeWeapon1);
    await weaponsRepository.save(weapon1);
    const weapon2 = await weaponsRepository.create(fakeWeapon2);
    await weaponsRepository.save(weapon2);

    const result = await weaponsRepository.getAllByUserIdAndBookId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns a weapon found with a specific user id and series id', async () => {
    const fakeWeapon = generateMockWeapon(series);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const result = await weaponsRepository.getByUserIdAndSeriesId(
      weapon.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: weapon.id,
        name: weapon.name,
        description: weapon.description,
        creator: weapon.creator,
        wielder: weapon.wielder,
        forged: weapon.forged,
      })
    );
  });

  it('returns a weapon found with a specific user id and series id and its relations', async () => {
    const fakeWeapon = generateMockWeapon(series);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const result = await weaponsRepository.getByUserIdAndSeriesId(
      weapon.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: weapon.id,
        name: weapon.name,
        description: weapon.description,
        creator: weapon.creator,
        wielder: weapon.wielder,
        forged: weapon.forged,
        books: [],
        series: expect.objectContaining({
          id: series.id,
          name: series.name,
          genre: series.genre,
        }),
      })
    );
  });

  it('returns null if no weapon found by a specific user id and series id', async () => {
    const fakeWeapon = generateMockWeapon(series);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const result = await weaponsRepository.getByUserIdAndSeriesId(
      weapon.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a weapon found with a specific user id and book id', async () => {
    const fakeWeapon = generateMockWeapon({}, [book]);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const result = await weaponsRepository.getByUserIdAndBookId(
      weapon.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: weapon.id,
        name: weapon.name,
        description: weapon.description,
        creator: weapon.creator,
        wielder: weapon.wielder,
        forged: weapon.forged,
      })
    );
  });

  it('returns a weapon found with a specific user id and book id and its relations', async () => {
    const fakeWeapon = generateMockWeapon({}, [book]);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const result = await weaponsRepository.getByUserIdAndBookId(
      weapon.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: weapon.id,
        name: weapon.name,
        description: weapon.description,
        creator: weapon.creator,
        wielder: weapon.wielder,
        forged: weapon.forged,
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

  it('returns null if no weapon found by a specific user id and book id', async () => {
    const fakeWeapon = generateMockWeapon({}, [book]);
    const weapon = await weaponsRepository.create(fakeWeapon);
    await weaponsRepository.save(weapon);

    const result = await weaponsRepository.getByUserIdAndBookId(
      weapon.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

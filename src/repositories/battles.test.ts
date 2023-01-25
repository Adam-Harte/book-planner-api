import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBattle } from '../mockData/battles';
import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBattlesRepository } from './battles';
import { getBooksRepository } from './books';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('Battles repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let battlesRepository: any;
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
    battlesRepository = getBattlesRepository(testDataSource);
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

  it('returns all battles found with matching user id and series id', async () => {
    const fakeBattle1 = generateMockBattle(series);
    const fakeBattle2 = generateMockBattle(series);

    const battle1 = await battlesRepository.create(fakeBattle1);
    await battlesRepository.save(battle1);
    const battle2 = await battlesRepository.create(fakeBattle2);
    await battlesRepository.save(battle2);

    const result = await battlesRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: battle1.id,
          name: battle1.name,
          start: battle1.start,
          end: battle1.end,
          description: battle1.description,
        }),
        expect.objectContaining({
          id: battle2.id,
          name: battle2.name,
          start: battle2.start,
          end: battle2.end,
          description: battle2.description,
        }),
      ])
    );
  });

  it('returns empty array if no battles found by matching user id and series id', async () => {
    const fakeBattle1 = generateMockBattle(series);
    const fakeBattle2 = generateMockBattle(series);

    const battle1 = await battlesRepository.create(fakeBattle1);
    await battlesRepository.save(battle1);
    const battle2 = await battlesRepository.create(fakeBattle2);
    await battlesRepository.save(battle2);

    const result = await battlesRepository.getAllByUserIdAndSeriesId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns all battles found with matching user id and book id', async () => {
    const fakeBattle1 = generateMockBattle({}, [book]);
    const fakeBattle2 = generateMockBattle({}, [book]);

    const battle1 = await battlesRepository.create(fakeBattle1);
    await battlesRepository.save(battle1);
    const battle2 = await battlesRepository.create(fakeBattle2);
    await battlesRepository.save(battle2);

    const result = await battlesRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: battle1.id,
          name: battle1.name,
          start: battle1.start,
          end: battle1.end,
          description: battle1.description,
        }),
        expect.objectContaining({
          id: battle2.id,
          name: battle2.name,
          start: battle2.start,
          end: battle2.end,
          description: battle2.description,
        }),
      ])
    );
  });

  it('returns empty array if no battles found by matching user id and book id', async () => {
    const fakeBattle1 = generateMockBattle({}, [book]);
    const fakeBattle2 = generateMockBattle({}, [book]);

    const battle1 = await battlesRepository.create(fakeBattle1);
    await battlesRepository.save(battle1);
    const battle2 = await battlesRepository.create(fakeBattle2);
    await battlesRepository.save(battle2);

    const result = await battlesRepository.getAllByUserIdAndBookId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns a battle found with a specific user id and series id', async () => {
    const fakeBattle = generateMockBattle(series);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const result = await battlesRepository.getByUserIdAndSeriesId(
      battle.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: battle.id,
        name: battle.name,
        start: battle.start,
        end: battle.end,
        description: battle.description,
      })
    );
  });

  it('returns a battle found with a specific user id and series id and its relations', async () => {
    const fakeBattle = generateMockBattle(series);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const result = await battlesRepository.getByUserIdAndSeriesId(
      battle.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: battle.id,
        name: battle.name,
        start: battle.start,
        end: battle.end,
        description: battle.description,
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

  it('returns null if no battle found by a specific user id and series id', async () => {
    const fakeBattle = generateMockBattle(series);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const result = await battlesRepository.getByUserIdAndSeriesId(
      battle.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a battle found with a specific user id and book id', async () => {
    const fakeBattle = generateMockBattle({}, [book]);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const result = await battlesRepository.getByUserIdAndBookId(
      battle.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: battle.id,
        name: battle.name,
        start: battle.start,
        end: battle.end,
        description: battle.description,
      })
    );
  });

  it('returns a battle found with a specific user id and book id and its relations', async () => {
    const fakeBattle = generateMockBattle({}, [book]);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const result = await battlesRepository.getByUserIdAndBookId(
      battle.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: battle.id,
        name: battle.name,
        start: battle.start,
        end: battle.end,
        description: battle.description,
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

  it('returns null if no battle found by a specific user id and book id', async () => {
    const fakeBattle = generateMockBattle({}, [book]);
    const battle = await battlesRepository.create(fakeBattle);
    await battlesRepository.save(battle);

    const result = await battlesRepository.getByUserIdAndBookId(
      battle.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

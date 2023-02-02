import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockGroup } from '../mockData/groups';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getGroupsRepository } from './groups';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('Groups repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let groupsRepository: any;
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
    groupsRepository = getGroupsRepository(testDataSource);
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

  it('returns all groups found with matching user id and series id', async () => {
    const fakeGroup1 = generateMockGroup(series);
    const fakeGroup2 = generateMockGroup(series);

    const group1 = await groupsRepository.create(fakeGroup1);
    await groupsRepository.save(group1);
    const group2 = await groupsRepository.create(fakeGroup2);
    await groupsRepository.save(group2);

    const result = await groupsRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: group1.id,
          name: group1.name,
          type: group1.type,
          description: group1.description,
        }),
        expect.objectContaining({
          id: group2.id,
          name: group2.name,
          type: group2.type,
          description: group2.description,
        }),
      ])
    );
  });

  it('returns empty array if no groups found by matching user id and series id', async () => {
    const fakeGroup1 = generateMockGroup(series);
    const fakeGroup2 = generateMockGroup(series);

    const group1 = await groupsRepository.create(fakeGroup1);
    await groupsRepository.save(group1);
    const group2 = await groupsRepository.create(fakeGroup2);
    await groupsRepository.save(group2);

    const result = await groupsRepository.getAllByUserIdAndSeriesId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns all groups found with matching user id and book id', async () => {
    const fakeGroup1 = generateMockGroup({}, [book]);
    const fakeGroup2 = generateMockGroup({}, [book]);

    const group1 = await groupsRepository.create(fakeGroup1);
    await groupsRepository.save(group1);
    const group2 = await groupsRepository.create(fakeGroup2);
    await groupsRepository.save(group2);

    const result = await groupsRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: group1.id,
          name: group1.name,
          type: group1.type,
          description: group1.description,
        }),
        expect.objectContaining({
          id: group2.id,
          name: group2.name,
          type: group2.type,
          description: group2.description,
        }),
      ])
    );
  });

  it('returns empty array if no groups found by matching user id and book id', async () => {
    const fakeGroup1 = generateMockGroup({}, [book]);
    const fakeGroup2 = generateMockGroup({}, [book]);

    const group1 = await groupsRepository.create(fakeGroup1);
    await groupsRepository.save(group1);
    const group2 = await groupsRepository.create(fakeGroup2);
    await groupsRepository.save(group2);

    const result = await groupsRepository.getAllByUserIdAndBookId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns a group found with a specific user id and series id', async () => {
    const fakeGroup = generateMockGroup(series);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const result = await groupsRepository.getByUserIdAndSeriesId(
      group.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: group.id,
        name: group.name,
        type: group.type,
        description: group.description,
      })
    );
  });

  it('returns a group found with a specific user id and series id and its relations', async () => {
    const fakeGroup = generateMockGroup(series);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const result = await groupsRepository.getByUserIdAndSeriesId(
      group.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: group.id,
        name: group.name,
        type: group.type,
        description: group.description,
        books: [],
        characters: [],
        setting: null,
        series: expect.objectContaining({
          id: series.id,
          name: series.name,
          genre: series.genre,
        }),
      })
    );
  });

  it('returns null if no group found by a specific user id and series id', async () => {
    const fakeGroup = generateMockGroup(series);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const result = await groupsRepository.getByUserIdAndSeriesId(
      group.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a group found with a specific user id and book id', async () => {
    const fakeGroup = generateMockGroup({}, [book]);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const result = await groupsRepository.getByUserIdAndBookId(
      group.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: group.id,
        name: group.name,
        type: group.type,
        description: group.description,
      })
    );
  });

  it('returns a group found with a specific user id and book id and its relations', async () => {
    const fakeGroup = generateMockGroup({}, [book]);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const result = await groupsRepository.getByUserIdAndBookId(
      group.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: group.id,
        name: group.name,
        type: group.type,
        description: group.description,
        books: [
          expect.objectContaining({
            id: book.id,
            name: book.name,
            genre: book.genre,
          }),
        ],
        characters: [],
        series: null,
        setting: null,
      })
    );
  });

  it('returns null if no group found by a specific user id and book id', async () => {
    const fakeGroup = generateMockGroup({}, [book]);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const result = await groupsRepository.getByUserIdAndBookId(
      group.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

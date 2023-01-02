import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('Series repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
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

  it('returns all series found with matching user id', async () => {
    const fakeUser = generateMockUser();

    const user = await usersRepository.create(fakeUser);
    const savedUser = await usersRepository.save(user);

    const fakeSeries1 = generateMockSeries(savedUser);
    const fakeSeries2 = generateMockSeries(savedUser);

    const series1 = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series1);

    const series2 = await seriesRepository.create(fakeSeries2);
    await seriesRepository.save(series2);

    const result = await seriesRepository.getAllByUserId(savedUser.id);

    const { id: series1id, name: series1name, genre: series1genre } = series1;
    const { id: series2id, name: series2name, genre: series2genre } = series1;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: series1id,
          name: series1name,
          genre: series1genre,
        }),
        expect.objectContaining({
          id: series2id,
          name: series2name,
          genre: series2genre,
        }),
      ])
    );
  });

  it('returns empty array if no series found by matching user id', async () => {
    const fakeUser1 = generateMockUser();
    const fakeUser2 = generateMockUser();

    const user1 = await usersRepository.create(fakeUser1);
    await usersRepository.save(user1);

    const user2 = await usersRepository.create(fakeUser2);
    await usersRepository.save(user2);

    const fakeSeries1 = generateMockSeries(user1);
    const fakeSeries2 = generateMockSeries(user1);

    const series1 = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series1);

    const series2 = await seriesRepository.create(fakeSeries2);
    await seriesRepository.save(series2);

    const result = await seriesRepository.getAllByUserId(user2.id);

    expect(result).toEqual([]);
  });

  it('returns a series found with a specific user id and series id', async () => {
    const fakeUser = generateMockUser();

    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);

    const fakeSeries1 = generateMockSeries(user);

    const series = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series);

    const result = await seriesRepository.getByUserIdAndSeriesId(
      user.id,
      series.id
    );

    const { id: seriesId, name: seriesName, genre: seriesGenre } = series;

    expect(result).toEqual(
      expect.objectContaining({
        id: seriesId,
        name: seriesName,
        genre: seriesGenre,
      })
    );
  });

  it('returns a series found with a specific user id and series id and its relations', async () => {
    const fakeUser = generateMockUser();

    const user = await usersRepository.create(fakeUser);
    await usersRepository.save(user);

    const fakeSeries1 = generateMockSeries(user);

    const series = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series);

    const result = await seriesRepository.getByUserIdAndSeriesId(
      user.id,
      series.id,
      true
    );

    const { id: seriesId, name: seriesName, genre: seriesGenre } = series;

    expect(result).toEqual(
      expect.objectContaining({
        id: seriesId,
        name: seriesName,
        genre: seriesGenre,
        books: [],
        settings: [],
        worlds: [],
        characters: [],
        plots: [],
        plotReferences: [],
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

  it('returns null if no series found by a specific user id and series id', async () => {
    const fakeUser1 = generateMockUser();
    const fakeUser2 = generateMockUser();

    const user1 = await usersRepository.create(fakeUser1);
    await usersRepository.save(user1);

    const user2 = await usersRepository.create(fakeUser2);
    await usersRepository.save(user2);

    const fakeSeries1 = generateMockSeries(user1);

    const series = await seriesRepository.create(fakeSeries1);
    await seriesRepository.save(series);

    const result = await seriesRepository.getByUserIdAndSeriesId(
      user2.id,
      series.id
    );

    expect(result).toBe(null);
  });
});

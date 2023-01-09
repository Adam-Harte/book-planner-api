import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockSetting } from '../mockData/settings';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getSeriesRepository } from './series';
import { getSettingsRepository } from './settings';
import { getUsersRepository } from './users';

describe('Settings repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let settingsRepository: any;
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
    settingsRepository = getSettingsRepository(testDataSource);
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

  it('returns all settings found with matching user id and series id', async () => {
    const fakeSetting1 = generateMockSetting(series);
    const fakeSetting2 = generateMockSetting(series);

    const setting1 = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting1);
    const setting2 = await settingsRepository.create(fakeSetting2);
    await settingsRepository.save(setting2);

    const result = await settingsRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    const {
      id: setting1id,
      name: setting1Name,
      description: setting1Description,
      type: setting1Type,
    } = setting1;
    const {
      id: setting2id,
      name: setting2Name,
      description: setting2Description,
      type: setting2Type,
    } = setting2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: setting1id,
          name: setting1Name,
          description: setting1Description,
          type: setting1Type,
        }),
        expect.objectContaining({
          id: setting2id,
          name: setting2Name,
          description: setting2Description,
          type: setting2Type,
        }),
      ])
    );
  });

  it('returns empty array if no settings found by matching user id and series id', async () => {
    const fakeSetting1 = generateMockSetting(series);
    const fakeSetting2 = generateMockSetting(series);

    const setting1 = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting1);
    const setting2 = await settingsRepository.create(fakeSetting2);
    await settingsRepository.save(setting2);

    const result = await settingsRepository.getAllByUserIdAndSeriesId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns all settings found with matching user id and book id', async () => {
    const fakeSetting1 = generateMockSetting({}, [book]);
    const fakeSetting2 = generateMockSetting({}, [book]);

    const setting1 = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting1);
    const setting2 = await settingsRepository.create(fakeSetting2);
    await settingsRepository.save(setting2);

    const result = await settingsRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    const {
      id: setting1id,
      name: setting1Name,
      description: setting1Description,
      type: setting1Type,
    } = setting1;
    const {
      id: setting2id,
      name: setting2Name,
      description: setting2Description,
      type: setting2Type,
    } = setting2;

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: setting1id,
          name: setting1Name,
          description: setting1Description,
          type: setting1Type,
        }),
        expect.objectContaining({
          id: setting2id,
          name: setting2Name,
          description: setting2Description,
          type: setting2Type,
        }),
      ])
    );
  });

  it('returns empty array if no settings found by matching user id and book id', async () => {
    const fakeSetting1 = generateMockSetting({}, [book]);
    const fakeSetting2 = generateMockSetting({}, [book]);

    const setting1 = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting1);
    const setting2 = await settingsRepository.create(fakeSetting2);
    await settingsRepository.save(setting2);

    const result = await settingsRepository.getAllByUserIdAndBookId(user.id, 2);

    expect(result).toEqual([]);
  });

  it('returns a setting found with a specific user id and series id', async () => {
    const fakeSetting1 = generateMockSetting(series);
    const setting = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting);

    const result = await settingsRepository.getByUserIdAndSeriesId(
      setting.id,
      user.id,
      series.id
    );

    const {
      id: settingId,
      name: settingName,
      description: settingDescription,
      type: settingType,
    } = setting;

    expect(result).toEqual(
      expect.objectContaining({
        id: settingId,
        name: settingName,
        description: settingDescription,
        type: settingType,
      })
    );
  });

  it('returns a setting found with a specific user id and series id and its relations', async () => {
    const fakeSetting1 = generateMockSetting(series);
    const setting = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting);

    const result = await settingsRepository.getByUserIdAndSeriesId(
      setting.id,
      user.id,
      series.id,
      true
    );

    const {
      id: settingId,
      name: settingName,
      description: settingDescription,
      type: settingType,
    } = setting;

    expect(result).toEqual(
      expect.objectContaining({
        id: settingId,
        name: settingName,
        description: settingDescription,
        type: settingType,
        artifacts: [],
        battles: [],
        books: [],
        characters: [],
        creatures: [],
        families: [],
        gods: [],
        governments: [],
        groups: [],
        histories: [],
        plots: [],
        races: [],
        religions: [],
        technologies: [],
        transports: [],
        world: null,
      })
    );
  });

  it('returns null if no setting found by a specific user id and series id', async () => {
    const fakeSetting1 = generateMockSetting(series);
    const setting = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting);

    const result = await settingsRepository.getByUserIdAndSeriesId(
      setting.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a setting found with a specific user id and book id', async () => {
    const fakeSetting1 = generateMockSetting({}, [book]);
    const setting = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting);

    const result = await settingsRepository.getByUserIdAndBookId(
      setting.id,
      user.id,
      book.id
    );

    const {
      id: settingId,
      name: settingName,
      description: settingDescription,
      type: settingType,
    } = setting;

    expect(result).toEqual(
      expect.objectContaining({
        id: settingId,
        name: settingName,
        description: settingDescription,
        type: settingType,
      })
    );
  });

  it('returns a setting found with a specific user id and book id and its relations', async () => {
    const fakeSetting1 = generateMockSetting({}, [book]);
    const setting = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting);

    const result = await settingsRepository.getByUserIdAndBookId(
      setting.id,
      user.id,
      book.id,
      true
    );

    const {
      id: settingId,
      name: settingName,
      description: settingDescription,
      type: settingType,
    } = setting;

    expect(result).toEqual(
      expect.objectContaining({
        id: settingId,
        name: settingName,
        description: settingDescription,
        type: settingType,
        artifacts: [],
        battles: [],
        books: [
          expect.objectContaining({
            id: book.id,
            name: book.name,
            genre: book.genre,
          }),
        ],
        characters: [],
        creatures: [],
        families: [],
        gods: [],
        governments: [],
        groups: [],
        histories: [],
        plots: [],
        races: [],
        religions: [],
        technologies: [],
        transports: [],
        series: null,
        world: null,
      })
    );
  });

  it('returns null if no setting found by a specific user id and book id', async () => {
    const fakeSetting1 = generateMockSetting({}, [book]);
    const setting = await settingsRepository.create(fakeSetting1);
    await settingsRepository.save(setting);

    const result = await settingsRepository.getByUserIdAndBookId(
      setting.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

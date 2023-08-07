import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockCreature } from '../mockData/creatures';
import { generateMockSeries } from '../mockData/series';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getCreaturesRepository } from './creatures';
import { getSeriesRepository } from './series';
import { getUsersRepository } from './users';

describe('Creatures repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let creaturesRepository: any;
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
    creaturesRepository = getCreaturesRepository(testDataSource);
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

  it('returns all creatures found with matching user id and series id', async () => {
    const fakeCreature1 = generateMockCreature(series);
    const fakeCreature2 = generateMockCreature(series);

    const creature1 = await creaturesRepository.create(fakeCreature1);
    await creaturesRepository.save(creature1);
    const creature2 = await creaturesRepository.create(fakeCreature2);
    await creaturesRepository.save(creature2);

    const result = await creaturesRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: creature1.id,
          name: creature1.name,
          physicalDescription: creature1.physicalDescription,
          personalityDescription: creature1.personalityDescription,
        }),
        expect.objectContaining({
          id: creature2.id,
          name: creature2.name,
          physicalDescription: creature2.physicalDescription,
          personalityDescription: creature2.personalityDescription,
        }),
      ])
    );
  });

  it('returns empty array if no creatures found by matching user id and series id', async () => {
    const fakeCreature1 = generateMockCreature();
    const fakeCreature2 = generateMockCreature();

    const creature1 = await creaturesRepository.create(fakeCreature1);
    await creaturesRepository.save(creature1);
    const creature2 = await creaturesRepository.create(fakeCreature2);
    await creaturesRepository.save(creature2);

    const result = await creaturesRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual([]);
  });

  it('returns all creatures found with matching user id and book id', async () => {
    const fakeCreature1 = generateMockCreature({}, [book]);
    const fakeCreature2 = generateMockCreature({}, [book]);

    const creature1 = await creaturesRepository.create(fakeCreature1);
    await creaturesRepository.save(creature1);
    const creature2 = await creaturesRepository.create(fakeCreature2);
    await creaturesRepository.save(creature2);

    const result = await creaturesRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: creature1.id,
          name: creature1.name,
          physicalDescription: creature1.physicalDescription,
          personalityDescription: creature1.personalityDescription,
        }),
        expect.objectContaining({
          id: creature2.id,
          name: creature2.name,
          physicalDescription: creature2.physicalDescription,
          personalityDescription: creature2.personalityDescription,
        }),
      ])
    );
  });

  it('returns empty array if no creatures found by matching user id and book id', async () => {
    const fakeCreature1 = generateMockCreature({}, []);
    const fakeCreature2 = generateMockCreature({}, []);

    const creature1 = await creaturesRepository.create(fakeCreature1);
    await creaturesRepository.save(creature1);
    const creature2 = await creaturesRepository.create(fakeCreature2);
    await creaturesRepository.save(creature2);

    const result = await creaturesRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual([]);
  });

  it('returns a creature found with a specific user id and series id', async () => {
    const fakeCreature = generateMockCreature(series);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const result = await creaturesRepository.getByUserIdAndSeriesId(
      creature.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: creature.id,
        name: creature.name,
        physicalDescription: creature.physicalDescription,
        personalityDescription: creature.personalityDescription,
      })
    );
  });

  it('returns a creature found with a specific user id and series id and its relations', async () => {
    const fakeCreature = generateMockCreature(series);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const result = await creaturesRepository.getByUserIdAndSeriesId(
      creature.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: creature.id,
        name: creature.name,
        physicalDescription: creature.physicalDescription,
        personalityDescription: creature.personalityDescription,
      })
    );
  });

  it('returns null if no creature found by a specific user id and series id', async () => {
    const fakeCreature = generateMockCreature(series);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const result = await creaturesRepository.getByUserIdAndSeriesId(
      creature.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a creature found with a specific user id and book id', async () => {
    const fakeCreature = generateMockCreature({}, [book]);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const result = await creaturesRepository.getByUserIdAndBookId(
      creature.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: creature.id,
        name: creature.name,
        physicalDescription: creature.physicalDescription,
        personalityDescription: creature.personalityDescription,
      })
    );
  });

  it('returns a creature found with a specific user id and book id and its relations', async () => {
    const fakeCreature = generateMockCreature({}, [book]);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const result = await creaturesRepository.getByUserIdAndBookId(
      creature.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: creature.id,
        name: creature.name,
        physicalDescription: creature.physicalDescription,
        personalityDescription: creature.personalityDescription,
      })
    );
  });

  it('returns null if no creature found by a specific user id and book id', async () => {
    const fakeCreature = generateMockCreature({}, [book]);
    const creature = await creaturesRepository.create(fakeCreature);
    await creaturesRepository.save(creature);

    const result = await creaturesRepository.getByUserIdAndBookId(
      creature.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

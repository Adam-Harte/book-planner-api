import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../mockData/books';
import { generateMockSeries } from '../mockData/series';
import { generateMockTransport } from '../mockData/transports';
import { generateMockUser } from '../mockData/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { getBooksRepository } from './books';
import { getSeriesRepository } from './series';
import { getTransportsRepository } from './transports';
import { getUsersRepository } from './users';

describe('Transports repository', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let booksRepository: any;
  let transportsRepository: any;
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
    transportsRepository = getTransportsRepository(testDataSource);
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

  it('returns all transports found with matching user id and series id', async () => {
    const fakeTransport1 = generateMockTransport(series);
    const fakeTransport2 = generateMockTransport(series);

    const transport1 = await transportsRepository.create(fakeTransport1);
    await transportsRepository.save(transport1);
    const transport2 = await transportsRepository.create(fakeTransport2);
    await transportsRepository.save(transport2);

    const result = await transportsRepository.getAllByUserIdAndSeriesId(
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: transport1.id,
          name: transport1.name,
          description: transport1.description,
        }),
        expect.objectContaining({
          id: transport2.id,
          name: transport2.name,
          description: transport2.description,
        }),
      ])
    );
  });

  it('returns empty array if no transports found by matching user id and series id', async () => {
    const fakeTransport1 = generateMockTransport(series);
    const fakeTransport2 = generateMockTransport(series);

    const transport1 = await transportsRepository.create(fakeTransport1);
    await transportsRepository.save(transport1);
    const transport2 = await transportsRepository.create(fakeTransport2);
    await transportsRepository.save(transport2);

    const result = await transportsRepository.getAllByUserIdAndSeriesId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns all transports found with matching user id and book id', async () => {
    const fakeTransport1 = generateMockTransport({}, [book]);
    const fakeTransport2 = generateMockTransport({}, [book]);

    const transport1 = await transportsRepository.create(fakeTransport1);
    await transportsRepository.save(transport1);
    const transport2 = await transportsRepository.create(fakeTransport2);
    await transportsRepository.save(transport2);

    const result = await transportsRepository.getAllByUserIdAndBookId(
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: transport1.id,
          name: transport1.name,
          description: transport1.description,
        }),
        expect.objectContaining({
          id: transport2.id,
          name: transport2.name,
          description: transport2.description,
        }),
      ])
    );
  });

  it('returns empty array if no transports found by matching user id and book id', async () => {
    const fakeTransport1 = generateMockTransport({}, [book]);
    const fakeTransport2 = generateMockTransport({}, [book]);

    const transport1 = await transportsRepository.create(fakeTransport1);
    await transportsRepository.save(transport1);
    const transport2 = await transportsRepository.create(fakeTransport2);
    await transportsRepository.save(transport2);

    const result = await transportsRepository.getAllByUserIdAndBookId(
      user.id,
      2
    );

    expect(result).toEqual([]);
  });

  it('returns a transport found with a specific user id and series id', async () => {
    const fakeTransport = generateMockTransport(series);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const result = await transportsRepository.getByUserIdAndSeriesId(
      transport.id,
      user.id,
      series.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: transport.id,
        name: transport.name,
        description: transport.description,
      })
    );
  });

  it('returns a transport found with a specific user id and series id and its relations', async () => {
    const fakeTransport = generateMockTransport(series);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const result = await transportsRepository.getByUserIdAndSeriesId(
      transport.id,
      user.id,
      series.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: transport.id,
        name: transport.name,
        description: transport.description,
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

  it('returns null if no transport found by a specific user id and series id', async () => {
    const fakeTransport = generateMockTransport(series);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const result = await transportsRepository.getByUserIdAndSeriesId(
      transport.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });

  it('returns a transport found with a specific user id and book id', async () => {
    const fakeTransport = generateMockTransport({}, [book]);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const result = await transportsRepository.getByUserIdAndBookId(
      transport.id,
      user.id,
      book.id
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: transport.id,
        name: transport.name,
        description: transport.description,
      })
    );
  });

  it('returns a transport found with a specific user id and book id and its relations', async () => {
    const fakeTransport = generateMockTransport({}, [book]);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const result = await transportsRepository.getByUserIdAndBookId(
      transport.id,
      user.id,
      book.id,
      true
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: transport.id,
        name: transport.name,
        description: transport.description,
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

  it('returns null if no transport found by a specific user id and book id', async () => {
    const fakeTransport = generateMockTransport({}, [book]);
    const transport = await transportsRepository.create(fakeTransport);
    await transportsRepository.save(transport);

    const result = await transportsRepository.getByUserIdAndBookId(
      transport.id,
      user.id,
      2
    );

    expect(result).toBe(null);
  });
});

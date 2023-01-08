import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockCharacter } from '../../mockData/characters';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import {
  CharactersRepository,
  getCharactersRepository,
} from '../../repositories/characters';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { getCharacters, GetCharactersReqQuery } from './getCharacters';

describe('getCharacters', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let charactersRepository: any;
  let fakeUser: any;
  let user: any;
  let fakeSeries: any;
  let series: any;
  let fakeBook: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    usersRepository = getUsersRepository(testDataSource);
    seriesRepository = getSeriesRepository(testDataSource);
    booksRepository = getBooksRepository(testDataSource);
    charactersRepository = getCharactersRepository(testDataSource);
    CharactersRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        charactersRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    CharactersRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        charactersRepository.getAllByUserIdAndBookId(userId, bookId)
      );
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

  it('should get all characters belonging to the user and a series', async () => {
    const fakeCharacter1 = generateMockCharacter(series);
    const fakeCharacter2 = generateMockCharacter(series);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);

    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getCharacters(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetCharactersReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CharactersRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Characters by user id and series id fetched.',
      data: [
        {
          id: character1.id,
          firstName: character1.firstName,
          type: character1.type,
        },
        {
          id: character2.id,
          firstName: character2.firstName,
          type: character2.type,
        },
      ],
    });
  });

  it('should get all characters belonging to the user and a book', async () => {
    const fakeCharacter1 = generateMockCharacter({}, [book]);
    const fakeCharacter2 = generateMockCharacter({}, [book]);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);

    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getCharacters(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetCharactersReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CharactersRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Characters by user id and book id fetched.',
      data: [
        {
          id: character1.id,
          firstName: character1.firstName,
          type: character1.type,
        },
        {
          id: character2.id,
          firstName: character2.firstName,
          type: character2.type,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeCharacter1 = generateMockCharacter(series, [book]);
    const fakeCharacter2 = generateMockCharacter(series, [book]);

    const character1 = await charactersRepository.create(fakeCharacter1);
    await charactersRepository.save(character1);

    const character2 = await charactersRepository.create(fakeCharacter2);
    await charactersRepository.save(character2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getCharacters(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetCharactersReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(
      CharactersRepository.getAllByUserIdAndSeriesId
    ).not.toHaveBeenCalled();
    expect(CharactersRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

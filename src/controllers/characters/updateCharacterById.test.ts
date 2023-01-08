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
import {
  updateCharacterById,
  UpdateCharacterReqBody,
  UpdateCharacterReqParams,
  UpdateCharacterReqQuery,
} from './updateCharacterById';

describe('updateCharacterById', () => {
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
    CharactersRepository.save = jest
      .fn()
      .mockImplementation((character: any) =>
        charactersRepository.save(character)
      );
    charactersRepository = getCharactersRepository(testDataSource);
    CharactersRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation(
        (characterId: number, userId: number, seriesId: number) =>
          charactersRepository.getByUserIdAndSeriesId(
            characterId,
            userId,
            seriesId
          )
      );
    CharactersRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation(
        (characterId: number, userId: number, bookId: number) =>
          charactersRepository.getByUserIdAndBookId(characterId, userId, bookId)
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeCharacter = generateMockCharacter(series, [book]);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const req = getMockReq({
      params: {
        characterId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateCharacterById(
      req as unknown as Request<
        UpdateCharacterReqParams,
        unknown,
        UpdateCharacterReqBody,
        UpdateCharacterReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CharactersRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a character is not fetched by a series or book id', async () => {
    const fakeCharacter = generateMockCharacter(series, [book]);
    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const req = getMockReq({
      params: {
        characterId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateCharacterById(
      req as unknown as Request<
        UpdateCharacterReqParams,
        unknown,
        UpdateCharacterReqBody,
        UpdateCharacterReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CharactersRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a character by a specific id and series id', async () => {
    const fakeCharacter = generateMockCharacter(series);
    const updatedFakeCharacter = generateMockCharacter();

    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const req = getMockReq({
      params: {
        characterId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeCharacter,
        },
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateCharacterById(
      req as unknown as Request<
        UpdateCharacterReqParams,
        unknown,
        UpdateCharacterReqBody,
        UpdateCharacterReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CharactersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeCharacter)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Character updated.',
      data: {
        id: 1,
        firstName: updatedFakeCharacter.firstName,
        type: updatedFakeCharacter.type,
      },
    });
  });

  it('should update a character by a specific id and book id', async () => {
    const fakeCharacter = generateMockCharacter({}, [book]);
    const updatedFakeCharacter = generateMockCharacter();

    const character = await charactersRepository.create(fakeCharacter);
    await charactersRepository.save(character);

    const req = getMockReq({
      params: {
        characterId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeCharacter,
        },
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateCharacterById(
      req as unknown as Request<
        UpdateCharacterReqParams,
        unknown,
        UpdateCharacterReqBody,
        UpdateCharacterReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(CharactersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeCharacter)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Character updated.',
      data: {
        id: 1,
        firstName: updatedFakeCharacter.firstName,
        type: updatedFakeCharacter.type,
      },
    });
  });
});

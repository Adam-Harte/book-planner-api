import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockCharacter } from '../../mockData/characters';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  CharactersRepository,
  getCharactersRepository,
} from '../../repositories/characters';
import {
  getSeriesRepository,
  SeriesRepository,
} from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { createCharacter } from './createCharacter';

describe('createCharacter', () => {
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
    SeriesRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        seriesRepository.getByUserIdAndSeriesId(userId, seriesId)
      );
    BooksRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        booksRepository.getByUserIdAndBookId(userId, bookId)
      );
    CharactersRepository.create = jest
      .fn()
      .mockImplementation((character: any) =>
        charactersRepository.create(character)
      );
    CharactersRepository.save = jest
      .fn()
      .mockImplementation((character: any) =>
        charactersRepository.save(character)
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

  it('fails if neither the seriesId or bookId query params are passed', async () => {
    const fakeCharacter = generateMockCharacter();
    const req = getMockReq({
      body: {
        firstName: fakeCharacter.firstName,
        lastName: fakeCharacter.lastName,
        title: fakeCharacter.title,
        type: fakeCharacter.type,
        physicalDescription: fakeCharacter.physicalDescription,
        personalityDescription: fakeCharacter.personalityDescription,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createCharacter(req as Request, res as Response);

    expect(CharactersRepository.create).not.toHaveBeenCalled();
    expect(CharactersRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new character belonging to a series', async () => {
    const fakeCharacter = generateMockCharacter();
    const req = getMockReq({
      body: {
        firstName: fakeCharacter.firstName,
        lastName: fakeCharacter.lastName,
        title: fakeCharacter.title,
        type: fakeCharacter.type,
        physicalDescription: fakeCharacter.physicalDescription,
        personalityDescription: fakeCharacter.personalityDescription,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createCharacter(req as Request, res as Response);

    expect(CharactersRepository.create).toHaveBeenCalledWith({
      firstName: req.body.firstName,
      type: req.body.type,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(CharactersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: req.body.firstName,
        type: req.body.type,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Character created.',
      data: {
        id: 1,
        firstName: fakeCharacter.firstName,
        type: fakeCharacter.type,
      },
    });
  });

  it('should create a new character belonging to a book', async () => {
    const fakeCharacter = generateMockCharacter();
    const req = getMockReq({
      body: {
        firstName: fakeCharacter.firstName,
        lastName: fakeCharacter.lastName,
        title: fakeCharacter.title,
        type: fakeCharacter.type,
        physicalDescription: fakeCharacter.physicalDescription,
        personalityDescription: fakeCharacter.personalityDescription,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createCharacter(req as Request, res as Response);

    expect(CharactersRepository.create).toHaveBeenCalledWith({
      firstName: req.body.firstName,
      type: req.body.type,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(CharactersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: req.body.firstName,
        type: req.body.type,
        books: [
          expect.objectContaining({
            id: 1,
            name: fakeBook.name,
            genre: fakeBook.genre,
          }),
        ],
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Character created.',
      data: {
        id: 1,
        firstName: fakeCharacter.firstName,
        type: fakeCharacter.type,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the character', async () => {
    const fakeCharacter = generateMockCharacter();
    const req = getMockReq({
      body: {
        firstName: fakeCharacter.firstName,
        lastName: fakeCharacter.lastName,
        title: fakeCharacter.title,
        type: fakeCharacter.type,
        physicalDescription: fakeCharacter.physicalDescription,
        personalityDescription: fakeCharacter.personalityDescription,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createCharacter(req as Request, res as Response);

    expect(CharactersRepository.create).not.toHaveBeenCalled();
    expect(CharactersRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A character must be created belonging to one of your series or books.',
    });
  });
});

import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockCreature } from '../../mockData/creatures';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  CreaturesRepository,
  getCreaturesRepository,
} from '../../repositories/creatures';
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
import { createCreature } from './createCreature';

describe('createCreature', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let creaturesRepository: any;
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
    creaturesRepository = getCreaturesRepository(testDataSource);
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
    CreaturesRepository.create = jest
      .fn()
      .mockImplementation((creature: any) =>
        creaturesRepository.create(creature)
      );
    CreaturesRepository.save = jest
      .fn()
      .mockImplementation((creature: any) =>
        creaturesRepository.save(creature)
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
    const fakeCreature = generateMockCreature();
    const req = getMockReq({
      body: {
        name: fakeCreature.name,
        personalityDescription: fakeCreature.personalityDescription,
        physicalDescription: fakeCreature.physicalDescription,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createCreature(req as Request, res as Response);

    expect(CreaturesRepository.create).not.toHaveBeenCalled();
    expect(CreaturesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new creature belonging to a series', async () => {
    const fakeCreature = generateMockCreature();
    const req = getMockReq({
      body: {
        name: fakeCreature.name,
        personalityDescription: fakeCreature.personalityDescription,
        physicalDescription: fakeCreature.physicalDescription,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createCreature(req as Request, res as Response);

    expect(CreaturesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      personalityDescription: req.body.personalityDescription,
      physicalDescription: req.body.physicalDescription,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(CreaturesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        personalityDescription: req.body.personalityDescription,
        physicalDescription: req.body.physicalDescription,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Creature created.',
      data: {
        id: 1,
        name: fakeCreature.name,
        personalityDescription: fakeCreature.personalityDescription,
        physicalDescription: fakeCreature.physicalDescription,
      },
    });
  });

  it('should create a new creature belonging to a book', async () => {
    const fakeCreature = generateMockCreature();
    const req = getMockReq({
      body: {
        name: fakeCreature.name,
        personalityDescription: fakeCreature.personalityDescription,
        physicalDescription: fakeCreature.physicalDescription,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createCreature(req as Request, res as Response);

    expect(CreaturesRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      personalityDescription: req.body.personalityDescription,
      physicalDescription: req.body.physicalDescription,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(CreaturesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        personalityDescription: req.body.personalityDescription,
        physicalDescription: req.body.physicalDescription,
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
      message: 'Creature created.',
      data: {
        id: 1,
        name: fakeCreature.name,
        personalityDescription: fakeCreature.personalityDescription,
        physicalDescription: fakeCreature.physicalDescription,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the creature', async () => {
    const fakeCreature = generateMockCreature();
    const req = getMockReq({
      body: {
        name: fakeCreature.name,
        personalityDescription: fakeCreature.personalityDescription,
        physicalDescription: fakeCreature.physicalDescription,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createCreature(req as Request, res as Response);

    expect(CreaturesRepository.create).not.toHaveBeenCalled();
    expect(CreaturesRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A creature must be created belonging to one of your series or books.',
    });
  });
});

import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockGroup } from '../../mockData/groups';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { BooksRepository, getBooksRepository } from '../../repositories/books';
import {
  getGroupsRepository,
  GroupsRepository,
} from '../../repositories/groups';
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
import {
  createGroup,
  CreateGroupReqBody,
  CreateGroupReqQuery,
} from './createGroup';

describe('createGroup', () => {
  let testDataSource: DataSource;
  let dbBackup: IBackup;
  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let groupsRepository: any;
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
    groupsRepository = getGroupsRepository(testDataSource);
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
    GroupsRepository.create = jest
      .fn()
      .mockImplementation((group: any) => groupsRepository.create(group));
    GroupsRepository.save = jest
      .fn()
      .mockImplementation((group: any) => groupsRepository.save(group));
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
    const fakeGroup = generateMockGroup();
    const req = getMockReq({
      body: {
        name: fakeGroup.name,
        description: fakeGroup.description,
        type: fakeGroup.type,
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createGroup(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateGroupReqBody,
        CreateGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.create).not.toHaveBeenCalled();
    expect(GroupsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should create a new group belonging to a series', async () => {
    const fakeGroup = generateMockGroup();
    const req = getMockReq({
      body: {
        name: fakeGroup.name,
        description: fakeGroup.description,
        type: fakeGroup.type,
      },
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createGroup(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateGroupReqBody,
        CreateGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      series: expect.objectContaining({
        id: 1,
        name: fakeSeries.name,
        genre: fakeSeries.genre,
      }),
    });
    expect(GroupsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        series: expect.objectContaining({
          id: 1,
          name: fakeSeries.name,
          genre: fakeSeries.genre,
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Group created.',
      data: {
        id: 1,
        name: fakeGroup.name,
        type: fakeGroup.type,
        description: fakeGroup.description,
      },
    });
  });

  it('should create a new group belonging to a book', async () => {
    const fakeGroup = generateMockGroup();
    const req = getMockReq({
      body: {
        name: fakeGroup.name,
        description: fakeGroup.description,
        type: fakeGroup.type,
      },
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createGroup(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateGroupReqBody,
        CreateGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.create).toHaveBeenCalledWith({
      name: req.body.name,
      type: req.body.type,
      description: req.body.description,
      books: [
        expect.objectContaining({
          id: 1,
          name: fakeBook.name,
          genre: fakeBook.genre,
        }),
      ],
    });
    expect(GroupsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
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
      message: 'Group created.',
      data: {
        id: 1,
        name: fakeGroup.name,
        type: fakeGroup.type,
        description: fakeGroup.description,
      },
    });
  });

  it('fails if neither a series or book can be found to attach to the group', async () => {
    const fakeGroup = generateMockGroup();
    const req = getMockReq({
      body: {
        name: fakeGroup.name,
        description: fakeGroup.description,
        type: fakeGroup.type,
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await createGroup(
      req as unknown as Request<
        Record<string, any> | undefined,
        unknown,
        CreateGroupReqBody,
        CreateGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.create).not.toHaveBeenCalled();
    expect(GroupsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message:
        'A group must be created belonging to one of your series or books.',
    });
  });
});

import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';
import { IBackup } from 'pg-mem';
import { DataSource } from 'typeorm/data-source';

import { generateMockBook } from '../../mockData/books';
import { generateMockGroup } from '../../mockData/groups';
import { generateMockSeries } from '../../mockData/series';
import { generateMockUser } from '../../mockData/users';
import { getBooksRepository } from '../../repositories/books';
import {
  getGroupsRepository,
  GroupsRepository,
} from '../../repositories/groups';
import { getSeriesRepository } from '../../repositories/series';
import { getUsersRepository } from '../../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../../setupTestDb';
import { HttpCode } from '../../types/httpCode';
import { getGroups, GetGroupsReqQuery } from './getGroups';

describe('getGroups', () => {
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
    GroupsRepository.getAllByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((userId: number, seriesId: number) =>
        groupsRepository.getAllByUserIdAndSeriesId(userId, seriesId)
      );
    GroupsRepository.getAllByUserIdAndBookId = jest
      .fn()
      .mockImplementation((userId: number, bookId: number) =>
        groupsRepository.getAllByUserIdAndBookId(userId, bookId)
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

  it('should get all groups belonging to the user and a series', async () => {
    const fakeGroup1 = generateMockGroup(series);
    const fakeGroup2 = generateMockGroup(series);

    const group1 = await groupsRepository.create(fakeGroup1);
    await groupsRepository.save(group1);

    const group2 = await groupsRepository.create(fakeGroup2);
    await groupsRepository.save(group2);

    const req = getMockReq({
      query: {
        seriesId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getGroups(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetGroupsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.getAllByUserIdAndSeriesId).toHaveBeenCalledWith(
      1,
      1
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Groups by user id and series id fetched.',
      data: [
        {
          id: group1.id,
          name: group1.name,
          type: group1.type,
          description: group1.description,
        },
        {
          id: group2.id,
          name: group2.name,
          type: group2.type,
          description: group2.description,
        },
      ],
    });
  });

  it('should get all groups belonging to the user and a book', async () => {
    const fakeGroup1 = generateMockGroup({}, [book]);
    const fakeGroup2 = generateMockGroup({}, [book]);

    const group1 = await groupsRepository.create(fakeGroup1);
    await groupsRepository.save(group1);

    const group2 = await groupsRepository.create(fakeGroup2);
    await groupsRepository.save(group2);

    const req = getMockReq({
      query: {
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();
    await getGroups(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetGroupsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.getAllByUserIdAndBookId).toHaveBeenCalledWith(1, 1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Groups by user id and book id fetched.',
      data: [
        {
          id: group1.id,
          name: group1.name,
          type: group1.type,
          description: group1.description,
        },
        {
          id: group2.id,
          name: group2.name,
          type: group2.type,
          description: group2.description,
        },
      ],
    });
  });

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeGroup1 = generateMockGroup(series);
    const fakeGroup2 = generateMockGroup(series);

    const group1 = await groupsRepository.create(fakeGroup1);
    await groupsRepository.save(group1);

    const group2 = await groupsRepository.create(fakeGroup2);
    await groupsRepository.save(group2);

    const req = getMockReq({
      userId: '1',
    });
    const { res } = getMockRes();
    await getGroups(
      req as unknown as Request<
        Record<string, string> | undefined,
        unknown,
        unknown,
        GetGroupsReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.getAllByUserIdAndSeriesId).not.toHaveBeenCalled();
    expect(GroupsRepository.getAllByUserIdAndBookId).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });
});

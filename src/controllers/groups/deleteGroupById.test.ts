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
import {
  deleteGroupById,
  DeleteGroupReqParams,
  DeleteGroupReqQuery,
} from './deleteGroupById';

describe('deleteGroupById', () => {
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
    GroupsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => groupsRepository.delete(id));
    GroupsRepository.getByUserIdAndSeriesId = jest
      .fn()
      .mockImplementation((groupId: number, userId: number, seriesId: number) =>
        groupsRepository.getByUserIdAndSeriesId(groupId, userId, seriesId)
      );
    GroupsRepository.getByUserIdAndBookId = jest
      .fn()
      .mockImplementation((groupId: number, userId: number, bookId: number) =>
        groupsRepository.getByUserIdAndBookId(groupId, userId, bookId)
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

  it('should fail if neither seriesId or bookId query params are passed', async () => {
    const fakeGroup = generateMockGroup(series, [book]);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const req = getMockReq({
      params: {
        groupId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteGroupById(
      req as unknown as Request<
        DeleteGroupReqParams,
        unknown,
        unknown,
        DeleteGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if the group being deleted does not belong to a series', async () => {
    const fakeGroup = generateMockGroup(series);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const req = getMockReq({
      params: {
        groupId: '1',
      },
      query: {
        seriesId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteGroupById(
      req as unknown as Request<
        DeleteGroupReqParams,
        unknown,
        unknown,
        DeleteGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should fail if the group being deleted does not belong to a book', async () => {
    const fakeGroup = generateMockGroup({}, [book]);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const req = getMockReq({
      params: {
        groupId: '1',
      },
      query: {
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteGroupById(
      req as unknown as Request<
        DeleteGroupReqParams,
        unknown,
        unknown,
        DeleteGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.delete).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should delete the group by a specific id', async () => {
    const fakeGroup = generateMockGroup(series, [book]);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const req = getMockReq({
      params: {
        groupId: '1',
      },
      query: {
        seriesId: '1',
        bookId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await deleteGroupById(
      req as unknown as Request<
        DeleteGroupReqParams,
        unknown,
        unknown,
        DeleteGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.delete).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Group deleted.',
    });
  });
});

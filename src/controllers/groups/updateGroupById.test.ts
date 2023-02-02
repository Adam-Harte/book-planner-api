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
  updateGroupById,
  UpdateGroupReqBody,
  UpdateGroupReqParams,
  UpdateGroupReqQuery,
} from './updateGroupById';

describe('updateGroupById', () => {
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
    GroupsRepository.save = jest
      .fn()
      .mockImplementation((group: any) => groupsRepository.save(group));
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

  it('should fail if neither seriesId or bookId query params passed', async () => {
    const fakeGroup = generateMockGroup(series, [book]);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const req = getMockReq({
      params: {
        battleId: '1',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateGroupById(
      req as unknown as Request<
        UpdateGroupReqParams,
        unknown,
        UpdateGroupReqBody,
        UpdateGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  });

  it('should fail if a group is not fetched by a series or book id', async () => {
    const fakeGroup = generateMockGroup(series, [book]);
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const req = getMockReq({
      params: {
        groupId: '1',
      },
      query: {
        seriesId: '2',
        bookId: '2',
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateGroupById(
      req as unknown as Request<
        UpdateGroupReqParams,
        unknown,
        UpdateGroupReqBody,
        UpdateGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.save).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(HttpCode.FORBIDDEN);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Forbidden account action.',
    });
  });

  it('should update a group by a specific id and series id', async () => {
    const fakeGroup = generateMockGroup(series);
    const updatedFakeGroup = generateMockGroup();
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const req = getMockReq({
      params: {
        groupId: '1',
      },
      query: {
        seriesId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeGroup,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateGroupById(
      req as unknown as Request<
        UpdateGroupReqParams,
        unknown,
        UpdateGroupReqBody,
        UpdateGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeGroup)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Group updated.',
      data: {
        id: 1,
        name: updatedFakeGroup.name,
        type: updatedFakeGroup.type,
        description: updatedFakeGroup.description,
      },
    });
  });

  it('should update a group by a specific id and book id', async () => {
    const fakeGroup = generateMockGroup({}, [book]);
    const updatedFakeGroup = generateMockGroup();
    const group = await groupsRepository.create(fakeGroup);
    await groupsRepository.save(group);

    const req = getMockReq({
      params: {
        groupId: '1',
      },
      query: {
        bookId: '1',
      },
      body: {
        updatedData: {
          ...updatedFakeGroup,
        },
      },
      userId: '1',
    });
    const { res } = getMockRes();

    await updateGroupById(
      req as unknown as Request<
        UpdateGroupReqParams,
        unknown,
        UpdateGroupReqBody,
        UpdateGroupReqQuery,
        Record<string, any>
      >,
      res as Response
    );

    expect(GroupsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updatedFakeGroup)
    );
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Group updated.',
      data: {
        id: 1,
        name: updatedFakeGroup.name,
        type: updatedFakeGroup.type,
        description: updatedFakeGroup.description,
      },
    });
  });
});

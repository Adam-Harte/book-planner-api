import { IBackup } from 'pg-mem';
import request from 'supertest';
import { DataSource } from 'typeorm/data-source';

import { app } from '../app';
import { generateMockBook } from '../mockData/books';
import { generateMockGroup } from '../mockData/groups';
import { generateMockSeries } from '../mockData/series';
import { BooksRepository, getBooksRepository } from '../repositories/books';
import { getGroupsRepository, GroupsRepository } from '../repositories/groups';
import { getSeriesRepository, SeriesRepository } from '../repositories/series';
import { getUsersRepository } from '../repositories/users';
import {
  destroyTestDataSource,
  setupTestDataSource,
  testDb,
} from '../setupTestDb';
import { HttpCode } from '../types/httpCode';

describe('Groups routes', () => {
  let server: any;
  let testDataSource: DataSource;
  let dbBackup: IBackup;

  let usersRepository: any;
  let seriesRepository: any;
  let booksRepository: any;
  let groupsRepository: any;
  let user: any;
  let series: any;
  let book: any;

  beforeAll(async () => {
    testDataSource = await setupTestDataSource();
    server = app.listen();
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
    GroupsRepository.delete = jest
      .fn()
      .mockImplementation((id: number) => groupsRepository.delete(id));
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
    user = await usersRepository.create({
      username: 'test',
      email: 'test@test.com',
      password: 'testUser123!',
    });
    await usersRepository.save(user);
    const fakeSeries = generateMockSeries(user);
    const createdSeries = await seriesRepository.create(fakeSeries);
    series = await seriesRepository.save(createdSeries);
    const fakeBook = generateMockBook(user);
    const createdBook = await booksRepository.create(fakeBook);
    book = await booksRepository.save(createdBook);
  });

  afterAll(async () => {
    await destroyTestDataSource(testDataSource);
    server.close();
  });

  describe('GET /groups', () => {
    it('fails if no seriesId and bookId query params passed', async () => {
      const fakeGroup1 = generateMockGroup(series, [book]);
      const fakeGroup2 = generateMockGroup(series, [book]);
      const group1 = await groupsRepository.create(fakeGroup1);
      await groupsRepository.save(group1);
      const group2 = await groupsRepository.create(fakeGroup2);
      await groupsRepository.save(group2);

      const response = await request(app)
        .get('/api/groups')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('gets all the groups belonging to the user and a series', async () => {
      const fakeGroup1 = generateMockGroup(series);
      const fakeGroup2 = generateMockGroup(series);
      const group1 = await groupsRepository.create(fakeGroup1);
      await groupsRepository.save(group1);
      const group2 = await groupsRepository.create(fakeGroup2);
      await groupsRepository.save(group2);

      const response = await request(app)
        .get('/api/groups?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
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

    it('gets all the groups belonging to the user and a book', async () => {
      const fakeGroup1 = generateMockGroup({}, [book]);
      const fakeGroup2 = generateMockGroup({}, [book]);
      const group1 = await groupsRepository.create(fakeGroup1);
      await groupsRepository.save(group1);
      const group2 = await groupsRepository.create(fakeGroup2);
      await groupsRepository.save(group2);

      const response = await request(app)
        .get('/api/groups?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
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

    it('fails authorization if no access_token cookie', async () => {
      const fakeGroup1 = generateMockGroup(series, [book]);
      const fakeGroup2 = generateMockGroup(series, [book]);
      const group1 = await groupsRepository.create(fakeGroup1);
      await groupsRepository.save(group1);
      const group2 = await groupsRepository.create(fakeGroup2);
      await groupsRepository.save(group2);

      const response = await request(app).get(
        '/api/groups?seriesId=1&bookId=1'
      );

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('POST /groups', () => {
    it('fails validation when no name sent', async () => {
      const fakeGroup = generateMockGroup();

      const response = await request(app)
        .post('/api/groups')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          description: fakeGroup.description,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'name field is required.',
            param: 'name',
          },
        ],
      });
    });

    it('fails if neither seriesId or bookId query param are passed', async () => {
      const fakeGroup = generateMockGroup();

      const response = await request(app)
        .post('/api/groups')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeGroup,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book is found belonging to the user', async () => {
      const fakeGroup = generateMockGroup();

      const response = await request(app)
        .post('/api/groups?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeGroup,
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'A group must be created belonging to one of your series or books.',
      });
    });

    it('creates a new group related to a series when /groups route is passed correct data and seriesId query param', async () => {
      const fakeGroup = generateMockGroup();

      const response = await request(app)
        .post('/api/groups?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeGroup,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Group created.',
        data: {
          id: 1,
          name: fakeGroup.name,
          type: fakeGroup.type,
          description: fakeGroup.description,
        },
      });
    });

    it('creates a new group related to a book when /groups route is passed correct data and bookId query param', async () => {
      const fakeGroup = generateMockGroup();

      const response = await request(app)
        .post('/api/groups?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          ...fakeGroup,
        });

      expect(response.statusCode).toBe(HttpCode.CREATED);
      expect(response.body).toEqual({
        message: 'Group created.',
        data: {
          id: 1,
          name: fakeGroup.name,
          type: fakeGroup.type,
          description: fakeGroup.description,
        },
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeGroup = generateMockGroup();

      const response = await request(app)
        .post('/api/groups?seriesId=1')
        .send({ ...fakeGroup });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('GET /groups:groupId', () => {
    it('gets a group belonging to the user and series', async () => {
      const fakeGroup = generateMockGroup(series);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .get('/api/groups/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Group by id and series id fetched.',
        data: expect.objectContaining({
          id: group.id,
          name: group.name,
          type: group.type,
          description: group.description,
        }),
      });
    });

    it('fails if a group is not found belonging to a series', async () => {
      const fakeGroup = generateMockGroup(series);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .get('/api/groups/1?seriesId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('gets a group belonging to the user and book', async () => {
      const fakeGroup = generateMockGroup({}, [book]);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .get('/api/groups/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Group by id and book id fetched.',
        data: expect.objectContaining({
          id: group.id,
          name: group.name,
          type: group.type,
          description: group.description,
        }),
      });
    });

    it('fails if a group is not found belonging to a book', async () => {
      const fakeGroup = generateMockGroup({}, [book]);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .get('/api/groups/1?bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('fails if neither seriesId and bookId query params are passed', async () => {
      const fakeGroup = generateMockGroup(series);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .get('/api/groups/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeGroup = generateMockGroup(series);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app).get('/api/groups/1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('PATCH /groups:groupId', () => {
    it('fails validation if no updatedData passed', async () => {
      const fakeGroup = generateMockGroup(series);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .patch('/api/groups/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message: 'Validation failed.',
        data: [
          {
            location: 'body',
            msg: 'updatedData field is required with data.',
            param: 'updatedData',
          },
        ],
      });
    });

    it('fails if neither seriesId or bookId query params are passed', async () => {
      const fakeGroup = generateMockGroup(series);
      const updatedFakeGroup = generateMockGroup();
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .patch('/api/groups/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeGroup,
          },
        });

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if a group belonging to a series or book cant be found', async () => {
      const fakeGroup = generateMockGroup(series, [book]);
      const updatedFakeGroup = generateMockGroup();
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .patch('/api/groups/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeGroup,
          },
        });

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('updates a group belonging to the user and a series', async () => {
      const fakeGroup = generateMockGroup(series);
      const updatedFakeGroup = generateMockGroup();
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .patch('/api/groups/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeGroup,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Group updated.',
        data: expect.objectContaining({
          id: group.id,
          name: updatedFakeGroup.name,
          type: updatedFakeGroup.type,
          description: updatedFakeGroup.description,
        }),
      });
    });

    it('updates a group belonging to the user and a book', async () => {
      const fakeGroup = generateMockGroup({}, [book]);
      const updatedFakeGroup = generateMockGroup();
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .patch('/api/groups/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ])
        .send({
          updatedData: {
            ...updatedFakeGroup,
          },
        });

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Group updated.',
        data: expect.objectContaining({
          id: group.id,
          name: updatedFakeGroup.name,
          type: updatedFakeGroup.type,
          description: updatedFakeGroup.description,
        }),
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeGroup = generateMockGroup(series);
      const updatedFakeGroup = generateMockGroup();
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .patch('/api/groups/1')
        .send({
          updatedData: {
            ...updatedFakeGroup,
          },
        });

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });

  describe('DELETE /groups:groupId', () => {
    it('fails if neither seriesId or bookId query params are passed.', async () => {
      const fakeGroup = generateMockGroup(series);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .delete('/api/groups/1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.BAD_REQUEST);
      expect(response.body).toEqual({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    });

    it('fails if neither a series or book by the user is found.', async () => {
      const fakeGroup = generateMockGroup(series, [book]);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .delete('/api/groups/1?seriesId=2&bookId=2')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.FORBIDDEN);
      expect(response.body).toEqual({
        message: 'Forbidden account action.',
      });
    });

    it('deletes a group belonging to the user and a series', async () => {
      const fakeGroup = generateMockGroup(series);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .delete('/api/groups/1?seriesId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Group deleted.',
      });
    });

    it('deletes a group belonging to the user and a book', async () => {
      const fakeGroup = generateMockGroup({}, [book]);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app)
        .delete('/api/groups/1?bookId=1')
        .set('Cookie', [
          `access_token=username-email-userId-_${user.username}-${user.email}-${user.id}-_expiresIn-; Path=/; HttpOnly`,
        ]);

      expect(response.statusCode).toBe(HttpCode.OK);
      expect(response.body).toEqual({
        message: 'Group deleted.',
      });
    });

    it('fails authorization if no access_token cookie', async () => {
      const fakeGroup = generateMockGroup(series);
      const group = await groupsRepository.create(fakeGroup);
      await groupsRepository.save(group);

      const response = await request(app).delete('/api/groups/1?seriesId=1');

      expect(response.statusCode).toBe(HttpCode.UNAUTHORIZED);
    });
  });
});

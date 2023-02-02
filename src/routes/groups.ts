import express from 'express';
import { body } from 'express-validator';

import {
  createGroup,
  CreateGroupReqBody,
  CreateGroupReqQuery,
} from '../controllers/groups/createGroup';
import {
  deleteGroupById,
  DeleteGroupReqParams,
  DeleteGroupReqQuery,
} from '../controllers/groups/deleteGroupById';
import {
  getGroupById,
  GetGroupByIdReqParams,
  GetGroupByIdReqQuery,
} from '../controllers/groups/getGroupById';
import { getGroups, GetGroupsReqQuery } from '../controllers/groups/getGroups';
import {
  updateGroupById,
  UpdateGroupReqBody,
  UpdateGroupReqParams,
  UpdateGroupReqQuery,
} from '../controllers/groups/updateGroupById';
import { authorization } from '../middlewares/authorization';

export const groupsRouter = express.Router();

groupsRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetGroupsReqQuery,
  Record<string, any>
>('/groups', authorization, getGroups);

groupsRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateGroupReqBody,
  CreateGroupReqQuery,
  Record<string, any>
>(
  '/groups',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createGroup
);

groupsRouter.get<
  GetGroupByIdReqParams,
  unknown,
  unknown,
  GetGroupByIdReqQuery,
  Record<string, any>
>('/groups/:groupId', authorization, getGroupById);

groupsRouter.patch<
  UpdateGroupReqParams,
  unknown,
  UpdateGroupReqBody,
  UpdateGroupReqQuery,
  Record<string, any>
>(
  '/groups/:groupId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateGroupById
);

groupsRouter.delete<
  DeleteGroupReqParams,
  unknown,
  unknown,
  DeleteGroupReqQuery,
  Record<string, any>
>('/groups/:groupId', authorization, deleteGroupById);

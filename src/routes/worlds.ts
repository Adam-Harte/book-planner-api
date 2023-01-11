import express from 'express';
import { body } from 'express-validator';

import {
  createWorld,
  CreateWorldReqBody,
  CreateWorldReqQuery,
} from '../controllers/worlds/createWorld';
import {
  deleteWorldById,
  DeleteWorldReqParams,
  DeleteWorldReqQuery,
} from '../controllers/worlds/deleteWorldById';
import {
  getWorldById,
  GetWorldByIdReqParams,
  GetWorldByIdReqQuery,
} from '../controllers/worlds/getWorldById';
import { getWorlds, GetWorldsReqQuery } from '../controllers/worlds/getWorlds';
import {
  updateWorldById,
  UpdateWorldReqBody,
  UpdateWorldReqParams,
  UpdateWorldReqQuery,
} from '../controllers/worlds/updateWorldById';
import { authorization } from '../middlewares/authorization';

export const worldsRouter = express.Router();

worldsRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetWorldsReqQuery,
  Record<string, any>
>('/worlds', authorization, getWorlds);

worldsRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateWorldReqBody,
  CreateWorldReqQuery,
  Record<string, any>
>(
  '/worlds',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createWorld
);

worldsRouter.get<
  GetWorldByIdReqParams,
  unknown,
  unknown,
  GetWorldByIdReqQuery,
  Record<string, any>
>('/worlds/:worldId', authorization, getWorldById);

worldsRouter.patch<
  UpdateWorldReqParams,
  unknown,
  UpdateWorldReqBody,
  UpdateWorldReqQuery,
  Record<string, any>
>(
  '/worlds/:worldId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateWorldById
);

worldsRouter.delete<
  DeleteWorldReqParams,
  unknown,
  unknown,
  DeleteWorldReqQuery,
  Record<string, any>
>('/worlds/:worldId', authorization, deleteWorldById);

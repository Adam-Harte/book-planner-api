import express from 'express';
import { body } from 'express-validator';

import {
  createCreature,
  CreateCreatureReqBody,
  CreateCreatureReqQuery,
} from '../controllers/creatures/createCreature';
import {
  deleteCreatureById,
  DeleteCreatureReqParams,
  DeleteCreatureReqQuery,
} from '../controllers/creatures/deleteCreatureById';
import {
  getCreatureById,
  GetCreatureByIdReqParams,
  GetCreatureByIdReqQuery,
} from '../controllers/creatures/getCreatureById';
import {
  getCreatures,
  GetCreaturesReqQuery,
} from '../controllers/creatures/getCreatures';
import {
  updateCreatureById,
  UpdateCreatureReqBody,
  UpdateCreatureReqParams,
  UpdateCreatureReqQuery,
} from '../controllers/creatures/updateCreatureById';
import { authorization } from '../middlewares/authorization';

export const creaturesRouter = express.Router();

creaturesRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetCreaturesReqQuery,
  Record<string, any>
>('/creatures', authorization, getCreatures);

creaturesRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateCreatureReqBody,
  CreateCreatureReqQuery,
  Record<string, any>
>(
  '/creatures',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createCreature
);

creaturesRouter.get<
  GetCreatureByIdReqParams,
  unknown,
  unknown,
  GetCreatureByIdReqQuery,
  Record<string, any>
>('/creatures/:creatureId', authorization, getCreatureById);

creaturesRouter.patch<
  UpdateCreatureReqParams,
  unknown,
  UpdateCreatureReqBody,
  UpdateCreatureReqQuery,
  Record<string, any>
>(
  '/creatures/:creatureId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateCreatureById
);

creaturesRouter.delete<
  DeleteCreatureReqParams,
  unknown,
  unknown,
  DeleteCreatureReqQuery,
  Record<string, any>
>('/creatures/:creatureId', authorization, deleteCreatureById);

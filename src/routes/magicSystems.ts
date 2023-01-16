import express from 'express';
import { body } from 'express-validator';

import {
  createMagicSystem,
  CreateMagicSystemReqBody,
  CreateMagicSystemReqQuery,
} from '../controllers/magicSystems/createMagicSystem';
import {
  deleteMagicSystemById,
  DeleteMagicSystemReqParams,
  DeleteMagicSystemReqQuery,
} from '../controllers/magicSystems/deleteMagicSystemById';
import {
  getMagicSystemById,
  GetMagicSystemByIdReqParams,
  GetMagicSystemByIdReqQuery,
} from '../controllers/magicSystems/getMagicSystemById';
import {
  getMagicSystems,
  GetMagicSystemsReqQuery,
} from '../controllers/magicSystems/getMagicSystems';
import {
  updateMagicSystemById,
  UpdateMagicSystemReqBody,
  UpdateMagicSystemReqParams,
  UpdateMagicSystemReqQuery,
} from '../controllers/magicSystems/updateMagicSystemById';
import { authorization } from '../middlewares/authorization';

export const magicSystemsRouter = express.Router();

magicSystemsRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetMagicSystemsReqQuery,
  Record<string, any>
>('/magic-systems', authorization, getMagicSystems);

magicSystemsRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateMagicSystemReqBody,
  CreateMagicSystemReqQuery,
  Record<string, any>
>(
  '/magic-systems',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createMagicSystem
);

magicSystemsRouter.get<
  GetMagicSystemByIdReqParams,
  unknown,
  unknown,
  GetMagicSystemByIdReqQuery,
  Record<string, any>
>('/magic-systems/:magicSystemId', authorization, getMagicSystemById);

magicSystemsRouter.patch<
  UpdateMagicSystemReqParams,
  unknown,
  UpdateMagicSystemReqBody,
  UpdateMagicSystemReqQuery,
  Record<string, any>
>(
  '/magic-systems/:magicSystemId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateMagicSystemById
);

magicSystemsRouter.delete<
  DeleteMagicSystemReqParams,
  unknown,
  unknown,
  DeleteMagicSystemReqQuery,
  Record<string, any>
>('/magic-systems/:magicSystemId', authorization, deleteMagicSystemById);

import express from 'express';
import { body } from 'express-validator';

import {
  createBattle,
  CreateBattleReqBody,
  CreateBattleReqQuery,
} from '../controllers/battles/createBattle';
import {
  deleteBattleById,
  DeleteBattleReqParams,
  DeleteBattleReqQuery,
} from '../controllers/battles/deleteBattleById';
import {
  getBattleById,
  GetBattleByIdReqParams,
  GetBattleByIdReqQuery,
} from '../controllers/battles/getBattleById';
import {
  getBattles,
  GetBattlesReqQuery,
} from '../controllers/battles/getBattles';
import {
  updateBattleById,
  UpdateBattleReqBody,
  UpdateBattleReqParams,
  UpdateBattleReqQuery,
} from '../controllers/battles/updateBattleById';
import { authorization } from '../middlewares/authorization';

export const battlesRouter = express.Router();

battlesRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetBattlesReqQuery,
  Record<string, any>
>('/battles', authorization, getBattles);

battlesRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateBattleReqBody,
  CreateBattleReqQuery,
  Record<string, any>
>(
  '/battles',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createBattle
);

battlesRouter.get<
  GetBattleByIdReqParams,
  unknown,
  unknown,
  GetBattleByIdReqQuery,
  Record<string, any>
>('/battles/:battleId', authorization, getBattleById);

battlesRouter.patch<
  UpdateBattleReqParams,
  unknown,
  UpdateBattleReqBody,
  UpdateBattleReqQuery,
  Record<string, any>
>(
  '/battles/:battleId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateBattleById
);

battlesRouter.delete<
  DeleteBattleReqParams,
  unknown,
  unknown,
  DeleteBattleReqQuery,
  Record<string, any>
>('/battles/:battleId', authorization, deleteBattleById);

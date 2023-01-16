import express from 'express';
import { body } from 'express-validator';

import {
  createWeapon,
  CreateWeaponReqBody,
  CreateWeaponReqQuery,
} from '../controllers/weapons/createWeapon';
import {
  deleteWeaponById,
  DeleteWeaponReqParams,
  DeleteWeaponReqQuery,
} from '../controllers/weapons/deleteWeaponById';
import {
  getWeaponById,
  GetWeaponByIdReqParams,
  GetWeaponByIdReqQuery,
} from '../controllers/weapons/getWeaponById';
import {
  getWeapons,
  GetWeaponsReqQuery,
} from '../controllers/weapons/getWeapons';
import {
  updateWeaponById,
  UpdateWeaponReqBody,
  UpdateWeaponReqParams,
  UpdateWeaponReqQuery,
} from '../controllers/weapons/updateWeaponById';
import { authorization } from '../middlewares/authorization';

export const weaponsRouter = express.Router();

weaponsRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetWeaponsReqQuery,
  Record<string, any>
>('/weapons', authorization, getWeapons);

weaponsRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateWeaponReqBody,
  CreateWeaponReqQuery,
  Record<string, any>
>(
  '/weapons',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createWeapon
);

weaponsRouter.get<
  GetWeaponByIdReqParams,
  unknown,
  unknown,
  GetWeaponByIdReqQuery,
  Record<string, any>
>('/weapons/:weaponId', authorization, getWeaponById);

weaponsRouter.patch<
  UpdateWeaponReqParams,
  unknown,
  UpdateWeaponReqBody,
  UpdateWeaponReqQuery,
  Record<string, any>
>(
  '/weapons/:weaponId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateWeaponById
);

weaponsRouter.delete<
  DeleteWeaponReqParams,
  unknown,
  unknown,
  DeleteWeaponReqQuery,
  Record<string, any>
>('/weapons/:weaponId', authorization, deleteWeaponById);

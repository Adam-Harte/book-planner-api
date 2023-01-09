import express from 'express';
import { body } from 'express-validator';

import {
  createSetting,
  CreateSettingReqBody,
  CreateSettingReqQuery,
} from '../controllers/settings/createSetting';
import {
  deleteSettingById,
  DeleteSettingReqParams,
  DeleteSettingReqQuery,
} from '../controllers/settings/deleteSettingById';
import {
  getSettingById,
  GetSettingByIdReqParams,
  GetSettingByIdReqQuery,
} from '../controllers/settings/getSettingById';
import {
  getSettings,
  GetSettingsReqQuery,
} from '../controllers/settings/getSettings';
import {
  updateSettingById,
  UpdateSettingReqBody,
  UpdateSettingReqParams,
  UpdateSettingReqQuery,
} from '../controllers/settings/updateSettingById';
import { authorization } from '../middlewares/authorization';

export const settingsRouter = express.Router();

settingsRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetSettingsReqQuery,
  Record<string, any>
>('/settings', authorization, getSettings);

settingsRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateSettingReqBody,
  CreateSettingReqQuery,
  Record<string, any>
>(
  '/settings',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createSetting
);

settingsRouter.get<
  GetSettingByIdReqParams,
  unknown,
  unknown,
  GetSettingByIdReqQuery,
  Record<string, any>
>('/settings/:settingId', authorization, getSettingById);

settingsRouter.patch<
  UpdateSettingReqParams,
  unknown,
  UpdateSettingReqBody,
  UpdateSettingReqQuery,
  Record<string, any>
>(
  '/settings/:settingId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateSettingById
);

settingsRouter.delete<
  DeleteSettingReqParams,
  unknown,
  unknown,
  DeleteSettingReqQuery,
  Record<string, any>
>('/settings/:settingId', authorization, deleteSettingById);

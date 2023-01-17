import express from 'express';
import { body } from 'express-validator';

import {
  createTechnology,
  CreateTechnologyReqBody,
  CreateTechnologyReqQuery,
} from '../controllers/technologies/createTechnology';
import {
  deleteTechnologyById,
  DeleteTechnologyReqParams,
  DeleteTechnologyReqQuery,
} from '../controllers/technologies/deleteTechnologyById';
import {
  getTechnologies,
  GetTechnologiesReqQuery,
} from '../controllers/technologies/getTechnologies';
import {
  getTechnologyById,
  GetTechnologyByIdReqParams,
  GetTechnologyByIdReqQuery,
} from '../controllers/technologies/getTechnologyById';
import {
  updateTechnologyById,
  UpdateTechnologyReqBody,
  UpdateTechnologyReqParams,
  UpdateTechnologyReqQuery,
} from '../controllers/technologies/updateTechnologyById';
import { authorization } from '../middlewares/authorization';

export const technologiesRouter = express.Router();

technologiesRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetTechnologiesReqQuery,
  Record<string, any>
>('/technologies', authorization, getTechnologies);

technologiesRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateTechnologyReqBody,
  CreateTechnologyReqQuery,
  Record<string, any>
>(
  '/technologies',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createTechnology
);

technologiesRouter.get<
  GetTechnologyByIdReqParams,
  unknown,
  unknown,
  GetTechnologyByIdReqQuery,
  Record<string, any>
>('/technologies/:technologyId', authorization, getTechnologyById);

technologiesRouter.patch<
  UpdateTechnologyReqParams,
  unknown,
  UpdateTechnologyReqBody,
  UpdateTechnologyReqQuery,
  Record<string, any>
>(
  '/technologies/:technologyId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateTechnologyById
);

technologiesRouter.delete<
  DeleteTechnologyReqParams,
  unknown,
  unknown,
  DeleteTechnologyReqQuery,
  Record<string, any>
>('/technologies/:technologyId', authorization, deleteTechnologyById);

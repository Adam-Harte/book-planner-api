import express from 'express';
import { body } from 'express-validator';

import {
  createPlotReference,
  CreatePlotReferenceReqBody,
  CreatePlotReferenceReqQuery,
} from '../controllers/plotReferences/createPlotReference';
import {
  deletePlotReferenceById,
  DeletePlotReferenceReqParams,
  DeletePlotReferenceReqQuery,
} from '../controllers/plotReferences/deletePlotReferenceById';
import {
  getPlotReferenceById,
  GetPlotReferenceByIdReqParams,
  GetPlotReferenceByIdReqQuery,
} from '../controllers/plotReferences/getPlotReferenceById';
import {
  getPlotReferences,
  GetPlotReferencesReqQuery,
} from '../controllers/plotReferences/getPlotReferences';
import {
  updatePlotReferenceById,
  UpdatePlotReferenceReqBody,
  UpdatePlotReferenceReqParams,
  UpdatePlotReferenceReqQuery,
} from '../controllers/plotReferences/updatePlotReferenceById';
import { authorization } from '../middlewares/authorization';

export const plotReferencesRouter = express.Router();

plotReferencesRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetPlotReferencesReqQuery,
  Record<string, any>
>('/plot-references', authorization, getPlotReferences);

plotReferencesRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreatePlotReferenceReqBody,
  CreatePlotReferenceReqQuery,
  Record<string, any>
>(
  '/plot-references',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createPlotReference
);

plotReferencesRouter.get<
  GetPlotReferenceByIdReqParams,
  unknown,
  unknown,
  GetPlotReferenceByIdReqQuery,
  Record<string, any>
>('/plot-references/:plotReferenceId', authorization, getPlotReferenceById);

plotReferencesRouter.patch<
  UpdatePlotReferenceReqParams,
  unknown,
  UpdatePlotReferenceReqBody,
  UpdatePlotReferenceReqQuery,
  Record<string, any>
>(
  '/plot-references/:plotReferenceId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updatePlotReferenceById
);

plotReferencesRouter.delete<
  DeletePlotReferenceReqParams,
  unknown,
  unknown,
  DeletePlotReferenceReqQuery,
  Record<string, any>
>('/plot-references/:plotReferenceId', authorization, deletePlotReferenceById);

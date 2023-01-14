import express from 'express';
import { body } from 'express-validator';

import {
  createPlot,
  CreatePlotReqBody,
  CreatePlotReqQuery,
} from '../controllers/plots/createPlot';
import {
  deletePlotById,
  DeletePlotReqParams,
  DeletePlotReqQuery,
} from '../controllers/plots/deletePlotById';
import {
  getPlotById,
  GetPlotByIdReqParams,
  GetPlotByIdReqQuery,
} from '../controllers/plots/getPlotById';
import { getPlots } from '../controllers/plots/getPlots';
import {
  updatePlotById,
  UpdatePlotReqBody,
  UpdatePlotReqParams,
  UpdatePlotReqQuery,
} from '../controllers/plots/updatePlotById';
import { authorization } from '../middlewares/authorization';

export const plotsRouter = express.Router();

plotsRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetPlotByIdReqQuery,
  Record<string, any>
>('/plots', authorization, getPlots);

plotsRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreatePlotReqBody,
  CreatePlotReqQuery,
  Record<string, any>
>(
  '/plots',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createPlot
);

plotsRouter.get<
  GetPlotByIdReqParams,
  unknown,
  unknown,
  GetPlotByIdReqQuery,
  Record<string, any>
>('/plots/:plotId', authorization, getPlotById);

plotsRouter.patch<
  UpdatePlotReqParams,
  unknown,
  UpdatePlotReqBody,
  UpdatePlotReqQuery,
  Record<string, any>
>(
  '/plots/:plotId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updatePlotById
);

plotsRouter.delete<
  DeletePlotReqParams,
  unknown,
  unknown,
  DeletePlotReqQuery,
  Record<string, any>
>('/plots/:plotId', authorization, deletePlotById);

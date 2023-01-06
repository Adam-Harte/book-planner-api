import express from 'express';
import { body } from 'express-validator';

import {
  createSeries,
  CreateSeriesReqBody,
} from '../controllers/series/createSeries';
import {
  deleteSeriesById,
  DeleteSeriesReqParams,
} from '../controllers/series/deleteSeriesById';
import { getSeries } from '../controllers/series/getSeries';
import {
  getSeriesById,
  GetSeriesByIdReqParams,
} from '../controllers/series/getSeriesById';
import {
  updateSeriesById,
  updateSeriesReqBody,
  updateSeriesReqParams,
} from '../controllers/series/updateSeriesById';
import { authorization } from '../middlewares/authorization';

export const seriesRouter = express.Router();

seriesRouter.get('/series', authorization, getSeries);

seriesRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateSeriesReqBody,
  Record<string, string>,
  Record<string, any>
>(
  '/series',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createSeries
);

seriesRouter.get<
  GetSeriesByIdReqParams,
  unknown,
  unknown,
  unknown,
  Record<string, any>
>('/series/:seriesId', authorization, getSeriesById);

seriesRouter.patch<
  updateSeriesReqParams,
  unknown,
  updateSeriesReqBody,
  Record<string, any> | undefined,
  Record<string, any>
>(
  '/series/:seriesId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateSeriesById
);

seriesRouter.delete<
  DeleteSeriesReqParams,
  unknown,
  unknown,
  unknown,
  Record<string, any>
>('/series/:seriesId', authorization, deleteSeriesById);

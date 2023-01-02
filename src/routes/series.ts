import express from 'express';
import { body } from 'express-validator';

import {
  createSeries,
  deleteSeriesById,
  getSeries,
  getSeriesById,
  updateSeriesById,
} from '../controllers/series';
import { authorization } from '../middlewares/authorization';

export const seriesRouter = express.Router();

seriesRouter.get('/series', authorization, getSeries);

seriesRouter.post(
  '/series',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createSeries
);

seriesRouter.get('/series/:seriesId', authorization, getSeriesById);

seriesRouter.patch(
  '/series/:seriesId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateSeriesById
);

seriesRouter.delete('/series/:seriesId', authorization, deleteSeriesById);

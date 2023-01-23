import express from 'express';
import { body } from 'express-validator';

import {
  createTransport,
  CreateTransportReqBody,
  CreateTransportReqQuery,
} from '../controllers/transports/createTransport';
import {
  deleteTransportById,
  DeleteTransportReqParams,
  DeleteTransportReqQuery,
} from '../controllers/transports/deleteTransportById';
import {
  getTransportById,
  GetTransportByIdReqParams,
  GetTransportByIdReqQuery,
} from '../controllers/transports/getTransportById';
import {
  getTransports,
  GetTransportsReqQuery,
} from '../controllers/transports/getTransports';
import {
  updateTransportById,
  UpdateTransportReqBody,
  UpdateTransportReqParams,
  UpdateTransportReqQuery,
} from '../controllers/transports/updateTransportById';
import { authorization } from '../middlewares/authorization';

export const transportsRouter = express.Router();

transportsRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetTransportsReqQuery,
  Record<string, any>
>('/transports', authorization, getTransports);

transportsRouter.post<
  Record<string, any> | undefined,
  unknown,
  CreateTransportReqBody,
  CreateTransportReqQuery,
  Record<string, any>
>(
  '/transports',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createTransport
);

transportsRouter.get<
  GetTransportByIdReqParams,
  unknown,
  unknown,
  GetTransportByIdReqQuery,
  Record<string, any>
>('/transports/:transportId', authorization, getTransportById);

transportsRouter.patch<
  UpdateTransportReqParams,
  unknown,
  UpdateTransportReqBody,
  UpdateTransportReqQuery,
  Record<string, any>
>(
  '/transports/:transportId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateTransportById
);

transportsRouter.delete<
  DeleteTransportReqParams,
  unknown,
  unknown,
  DeleteTransportReqQuery,
  Record<string, any>
>('/transports/:transportId', authorization, deleteTransportById);

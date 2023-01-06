import express from 'express';
import { body } from 'express-validator';

import {
  createBook,
  CreateBookReqBody,
  CreateBookReqQuery,
} from '../controllers/books/createBook';
import {
  deleteBookById,
  DeleteBookReqParams,
} from '../controllers/books/deleteBookById';
import {
  getBookById,
  GetBookByIdReqParams,
} from '../controllers/books/getBookById';
import { getBooks, GetBooksReqQuery } from '../controllers/books/getBooks';
import {
  updateBookById,
  updateBookReqBody,
  updateBookReqParams,
} from '../controllers/books/updateBookById';
import { authorization } from '../middlewares/authorization';

export const booksRouter = express.Router();

booksRouter.get<
  Record<string, string> | undefined,
  unknown,
  unknown,
  GetBooksReqQuery,
  Record<string, any>
>('/books', authorization, getBooks);

booksRouter.post<
  Record<string, string> | undefined,
  unknown,
  CreateBookReqBody,
  CreateBookReqQuery,
  Record<string, any>
>(
  '/books',
  authorization,
  body('name').exists().withMessage('name field is required.'),
  createBook
);

booksRouter.get<
  GetBookByIdReqParams,
  unknown,
  unknown,
  unknown,
  Record<string, any>
>('/books/:bookId', authorization, getBookById);

booksRouter.patch<
  updateBookReqParams,
  unknown,
  updateBookReqBody,
  Record<string, any> | undefined,
  Record<string, any>
>(
  '/books/:bookId',
  authorization,
  body('updatedData')
    .not()
    .isEmpty()
    .withMessage('updatedData field is required with data.'),
  updateBookById
);

booksRouter.delete<
  DeleteBookReqParams,
  unknown,
  unknown,
  unknown,
  Record<string, any>
>('/books/:bookId', authorization, deleteBookById);

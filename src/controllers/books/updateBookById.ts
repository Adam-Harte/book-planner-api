import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { Genre } from '../../models/types/enums';
import { BooksRepository } from '../../repositories/books';
import { HttpCode } from '../../types/httpCode';

export interface updateBookReqParams {
  bookId: string;
}

export interface updateBookReqBody {
  updatedData: {
    name?: string;
    genre?: Genre;
  };
}

export const updateBookById = async (
  req: Request<
    updateBookReqParams,
    unknown,
    updateBookReqBody,
    Record<string, any> | undefined,
    Record<string, any>
  >,
  res: Response
) => {
  const { bookId } = req.params;
  const { updatedData } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

  try {
    const book = await BooksRepository.getByUserIdAndBookId(
      parseInt(req.userId as string, 10),
      parseInt(bookId, 10)
    );

    if (!book) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    const updatedBook = {
      ...book,
      ...updatedData,
    };

    const { id, name, genre } = await BooksRepository.save(updatedBook);

    return res.status(HttpCode.OK).json({
      message: 'Book updated.',
      data: {
        id,
        name,
        genre,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

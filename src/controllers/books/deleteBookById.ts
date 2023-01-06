import { Request, Response } from 'express';

import { BooksRepository } from '../../repositories/books';
import { HttpCode } from '../../types/httpCode';

export interface DeleteBookReqParams {
  bookId: string;
}

export const deleteBookById = async (
  req: Request<
    DeleteBookReqParams,
    unknown,
    unknown,
    unknown,
    Record<string, any>
  >,
  res: Response
) => {
  const { bookId } = req.params;

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

    await BooksRepository.delete(parseInt(bookId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Book deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

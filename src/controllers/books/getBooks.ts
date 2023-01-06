import { Request, Response } from 'express';

import { BooksRepository } from '../../repositories/books';
import { HttpCode } from '../../types/httpCode';

export interface GetBooksReqQuery {
  seriesId?: string;
}

export const getBooks = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetBooksReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId } = req.query;

  try {
    if (seriesId) {
      const seriesBooks = await BooksRepository.getAllByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Books by user id and series id fetched.',
        data: seriesBooks.map((book) => ({
          id: book.id,
          name: book.name,
          genre: book.genre,
        })),
      });
    }

    const books = await BooksRepository.getAllByUserId(
      parseInt(req.userId as string, 10)
    );

    return res.status(HttpCode.OK).json({
      message: 'Books by user id fetched.',
      data: books.map((book) => ({
        id: book.id,
        name: book.name,
        genre: book.genre,
      })),
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

import { Request, Response } from 'express';

import { CharactersRepository } from '../../repositories/characters';
import { HttpCode } from '../../types/httpCode';

export interface GetCharactersReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getCharacters = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetCharactersReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesCharacters =
        await CharactersRepository.getAllByUserIdAndSeriesId(
          parseInt(req.userId as string, 10),
          parseInt(seriesId as string, 10)
        );

      return res.status(HttpCode.OK).json({
        message: 'Characters by user id and series id fetched.',
        data: seriesCharacters.map((character) => ({
          id: character.id,
          firstName: character.firstName,
          type: character.type,
        })),
      });
    }

    if (bookId) {
      const bookCharacters = await CharactersRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Characters by user id and book id fetched.',
        data: bookCharacters.map((character) => ({
          id: character.id,
          firstName: character.firstName,
          type: character.type,
        })),
      });
    }

    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'At least one of seriesId or bookId query param must be passed.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

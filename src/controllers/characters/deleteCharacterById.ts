import { Request, Response } from 'express';

import { CharactersRepository } from '../../repositories/characters';
import { HttpCode } from '../../types/httpCode';

export interface DeleteCharacterReqParams {
  characterId: string;
}

export interface DeleteCharacterReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteCharacterById = async (
  req: Request<
    DeleteCharacterReqParams,
    unknown,
    unknown,
    DeleteCharacterReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { characterId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesCharacter;
    let bookCharacter;

    if (seriesId) {
      seriesCharacter = await CharactersRepository.getByUserIdAndSeriesId(
        parseInt(characterId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookCharacter = await CharactersRepository.getByUserIdAndBookId(
        parseInt(characterId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesCharacter && !bookCharacter) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await CharactersRepository.delete(parseInt(characterId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Character deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

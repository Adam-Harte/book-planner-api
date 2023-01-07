import { Request, Response } from 'express';

import { CharactersRepository } from '../../repositories/characters';
import { HttpCode } from '../../types/httpCode';

export interface GetCharacterByIdReqParams {
  characterId: string;
}

export interface GetCharacterByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getCharacterById = async (
  req: Request<
    GetCharacterByIdReqParams,
    unknown,
    unknown,
    GetCharacterByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { characterId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesCharacter = await CharactersRepository.getByUserIdAndSeriesId(
        parseInt(characterId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesCharacter) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Character by id and series id fetched.',
        data: {
          id: seriesCharacter.id,
          firstName: seriesCharacter?.firstName,
          type: seriesCharacter?.type,
          plots: seriesCharacter?.plots,
          groups: seriesCharacter?.groups,
          races: seriesCharacter?.races,
          family: seriesCharacter?.family,
        },
      });
    }

    if (bookId) {
      const bookCharacter = await CharactersRepository.getByUserIdAndBookId(
        parseInt(characterId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookCharacter) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Character by id and book id fetched.',
        data: {
          id: bookCharacter.id,
          firstName: bookCharacter?.firstName,
          type: bookCharacter?.type,
          plots: bookCharacter?.plots,
          groups: bookCharacter?.groups,
          races: bookCharacter?.races,
          family: bookCharacter?.family,
        },
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

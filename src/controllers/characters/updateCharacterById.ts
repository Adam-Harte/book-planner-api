import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { CharacterType } from '../../models/types/enums';
import { CharactersRepository } from '../../repositories/characters';
import { HttpCode } from '../../types/httpCode';

export interface UpdateCharacterReqParams {
  characterId: string;
}

export interface UpdateCharacterReqBody {
  updatedData: {
    firstName?: string;
    type?: CharacterType;
  };
}

export interface UpdateCharacterReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateCharacterById = async (
  req: Request<
    UpdateCharacterReqParams,
    unknown,
    UpdateCharacterReqBody,
    UpdateCharacterReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { characterId } = req.params;
  const { updatedData } = req.body;
  const { seriesId, bookId } = req.query;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HttpCode.BAD_REQUEST).json({
      message: 'Validation failed.',
      data: errors.array(),
    });
  }

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

    const updatedCharacter = {
      ...seriesCharacter,
      ...bookCharacter,
      ...updatedData,
    };

    const { id, firstName, type } = await CharactersRepository.save(
      updatedCharacter
    );

    return res.status(HttpCode.OK).json({
      message: 'Character updated.',
      data: {
        id,
        firstName,
        type,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

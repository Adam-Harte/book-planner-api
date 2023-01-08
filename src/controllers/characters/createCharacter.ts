import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import {
  CharacterGender,
  CharacterTitle,
  CharacterType,
  HeightMetric,
  WeightMetric,
} from '../../models/types/enums';
import { BooksRepository } from '../../repositories/books';
import { CharactersRepository } from '../../repositories/characters';
import { SeriesRepository } from '../../repositories/series';
import { HttpCode } from '../../types/httpCode';

export interface CreateCharacterReqBody {
  firstName: string;
  lastName?: string;
  title?: CharacterTitle;
  type: CharacterType;
  age?: number;
  gender?: CharacterGender;
  height?: number;
  heightMetric?: HeightMetric;
  weight?: number;
  weightMetric?: WeightMetric;
  physicalDescription?: string;
  personalityDescription?: string;
  characterArc?: string;
  image?: string;
}

export interface CreateCharacterReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const createCharacter = async (
  req: Request<
    Record<string, any> | undefined,
    unknown,
    CreateCharacterReqBody,
    CreateCharacterReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { firstName, type } = req.body;
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

    let series;
    let book;

    if (seriesId) {
      series = await SeriesRepository.getByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId, 10)
      );
    }

    if (bookId) {
      book = await BooksRepository.getByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId, 10)
      );
    }

    if (!series && !book) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'A character must be created belonging to one of your series or books.',
      });
    }

    const character = await CharactersRepository.create({
      firstName,
      type,
      ...(series && { series }),
      ...(book && { books: [book] }),
    });
    const {
      id,
      firstName: dataFirstName,
      type: dataType,
    } = await CharactersRepository.save(character);

    return res.status(HttpCode.CREATED).json({
      message: 'Character created.',
      data: {
        id,
        firstName: dataFirstName,
        type: dataType,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

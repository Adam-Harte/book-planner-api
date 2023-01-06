import { Request, Response } from 'express';

import { BooksRepository } from '../../repositories/books';
import { HttpCode } from '../../types/httpCode';

export interface GetBookByIdReqParams {
  bookId: string;
}

export const getBookById = async (
  req: Request<
    GetBookByIdReqParams,
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

    return res.status(HttpCode.OK).json({
      message: 'Book by id fetched.',
      ...(book && {
        data: {
          id: book.id,
          name: book.name,
          genre: book.genre,
          series: book.series,
          settings: book.settings,
          worlds: book.worlds,
          characters: book.characters,
          plots: book.plots,
          magicSystems: book.magicSystems,
          weapons: book.weapons,
          technologies: book.technologies,
          transports: book.transports,
          battles: book.battles,
          groups: book.groups,
          creatures: book.creatures,
          races: book.races,
          languages: book.languages,
          songs: book.songs,
          families: book.families,
          governments: book.governments,
          religions: book.religions,
          gods: book.gods,
          artifacts: book.artifacts,
          legends: book.legends,
          histories: book.histories,
          maps: book.maps,
        },
      }),
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

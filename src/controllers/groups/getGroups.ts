import { Request, Response } from 'express';

import { GroupsRepository } from '../../repositories/groups';
import { HttpCode } from '../../types/httpCode';

export interface GetGroupsReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getGroups = async (
  req: Request<
    Record<string, string> | undefined,
    unknown,
    unknown,
    GetGroupsReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesGroups = await GroupsRepository.getAllByUserIdAndSeriesId(
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Groups by user id and series id fetched.',
        data: seriesGroups.map((group) => ({
          id: group.id,
          name: group.name,
          type: group.type,
          description: group.description,
        })),
      });
    }

    if (bookId) {
      const bookGroups = await GroupsRepository.getAllByUserIdAndBookId(
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      return res.status(HttpCode.OK).json({
        message: 'Groups by user id and book id fetched.',
        data: bookGroups.map((group) => ({
          id: group.id,
          name: group.name,
          type: group.type,
          description: group.description,
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

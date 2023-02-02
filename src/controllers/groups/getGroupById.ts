import { Request, Response } from 'express';

import { GroupsRepository } from '../../repositories/groups';
import { HttpCode } from '../../types/httpCode';

export interface GetGroupByIdReqParams {
  groupId: string;
}

export interface GetGroupByIdReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const getGroupById = async (
  req: Request<
    GetGroupByIdReqParams,
    unknown,
    unknown,
    GetGroupByIdReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { groupId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (seriesId) {
      const seriesGroup = await GroupsRepository.getByUserIdAndSeriesId(
        parseInt(groupId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );

      if (!seriesGroup) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Group by id and series id fetched.',
        data: {
          id: seriesGroup.id,
          name: seriesGroup.name,
          type: seriesGroup.type,
          description: seriesGroup.description,
        },
      });
    }

    if (bookId) {
      const bookGroup = await GroupsRepository.getByUserIdAndBookId(
        parseInt(groupId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );

      if (!bookGroup) {
        return res.status(HttpCode.FORBIDDEN).json({
          message: 'Forbidden account action.',
        });
      }

      return res.status(HttpCode.OK).json({
        message: 'Group by id and book id fetched.',
        data: {
          id: bookGroup.id,
          name: bookGroup.name,
          type: bookGroup.type,
          description: bookGroup.description,
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

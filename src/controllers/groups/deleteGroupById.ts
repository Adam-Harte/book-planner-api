import { Request, Response } from 'express';

import { GroupsRepository } from '../../repositories/groups';
import { HttpCode } from '../../types/httpCode';

export interface DeleteGroupReqParams {
  groupId: string;
}

export interface DeleteGroupReqQuery {
  seriesId?: string;
  bookId?: string;
}

export const deleteGroupById = async (
  req: Request<
    DeleteGroupReqParams,
    unknown,
    unknown,
    DeleteGroupReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { groupId } = req.params;
  const { seriesId, bookId } = req.query;

  try {
    if (!seriesId && !bookId) {
      return res.status(HttpCode.BAD_REQUEST).json({
        message:
          'At least one of seriesId or bookId query param must be passed.',
      });
    }

    let seriesGroup;
    let bookGroup;

    if (seriesId) {
      seriesGroup = await GroupsRepository.getByUserIdAndSeriesId(
        parseInt(groupId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(seriesId as string, 10)
      );
    }

    if (bookId) {
      bookGroup = await GroupsRepository.getByUserIdAndBookId(
        parseInt(groupId as string, 10),
        parseInt(req.userId as string, 10),
        parseInt(bookId as string, 10)
      );
    }

    if (!seriesGroup && !bookGroup) {
      return res.status(HttpCode.FORBIDDEN).json({
        message: 'Forbidden account action.',
      });
    }

    await GroupsRepository.delete(parseInt(groupId, 10));

    return res.status(HttpCode.OK).json({
      message: 'Group deleted.',
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

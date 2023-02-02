import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import { GroupType } from '../../models/types/enums';
import { GroupsRepository } from '../../repositories/groups';
import { HttpCode } from '../../types/httpCode';

export interface UpdateGroupReqParams {
  groupId: string;
}

export interface UpdateGroupReqBody {
  updatedData: {
    name?: string;
    type?: GroupType;
    description?: string;
  };
}

export interface UpdateGroupReqQuery {
  seriesId: string;
  bookId: string;
}

export const updateGroupById = async (
  req: Request<
    UpdateGroupReqParams,
    unknown,
    UpdateGroupReqBody,
    UpdateGroupReqQuery,
    Record<string, any>
  >,
  res: Response
) => {
  const { groupId } = req.params;
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

    const updatedBattle = {
      ...seriesGroup,
      ...bookGroup,
      ...updatedData,
    };

    const { id, name, type, description } = await GroupsRepository.save(
      updatedBattle
    );

    return res.status(HttpCode.OK).json({
      message: 'Group updated.',
      data: {
        id,
        name,
        type,
        description,
      },
    });
  } catch (err) {
    return res.status(HttpCode.INTERNAL_SERVER_ERROR).json({
      message: err,
    });
  }
};

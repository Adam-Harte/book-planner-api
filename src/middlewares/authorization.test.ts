import { getMockReq, getMockRes } from '@jest-mock/express';
import { NextFunction, Request, Response } from 'express';

import { HttpCode } from '../types/httpCode';
import { authorization } from './authorization';

describe('Authorization middleware', () => {
  it('should fail when trying authroization without an access_token cookie', async () => {
    const req = getMockReq();
    const { res, next } = getMockRes();
    await authorization(req as Request, res as Response, next as NextFunction);

    expect(req.userId).toBe(undefined);
    expect(req.username).toBe(undefined);
    expect(res.sendStatus).toHaveBeenCalledWith(HttpCode.UNAUTHORIZED);
  });

  it('should get the userId and username from the access_token cookie, set them to the req and call next', async () => {
    const req = getMockReq({
      cookies: {
        access_token: 'username-email-userId-_test-test%40test.com-1-',
      },
      userId: null,
      username: null,
    });
    const { res, next } = getMockRes();
    await authorization(req as Request, res as Response, next as NextFunction);

    expect(req.userId).toBe('1');
    expect(req.username).toBe('test');
    expect(next).toHaveBeenCalled();
  });
});

import { getMockReq, getMockRes } from '@jest-mock/express';
import { Request, Response } from 'express';

import { HttpCode } from '../../types/httpCode';
import { logout } from './logout';

describe('logout', () => {
  it('should logout the user by clearing the access_token cookie', async () => {
    const req = getMockReq();
    const { res } = getMockRes();

    await logout(req as Request, res as Response);

    expect(res.clearCookie).toHaveBeenCalledWith('access_token');
    expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Successfully logged out.',
    });
  });
});

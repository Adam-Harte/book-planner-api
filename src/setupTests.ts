import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

beforeAll(async () => {
  bcrypt.hash = jest
    .fn()
    .mockImplementation((s: string, salt: string | number) =>
      Promise.resolve(`${s}-${salt}`)
    );

  bcrypt.compare = jest
    .fn()
    .mockImplementation(async (s: string, hash: string) => {
      const hashed1 = await bcrypt.hash(s, 12);
      const hashed2 = await bcrypt.hash(hash, 12);

      return Promise.resolve(hashed1 === hashed2);
    });

  jwt.sign = jest
    .fn()
    .mockImplementation((payload: object, _secret: string, options: object) => {
      const payloadKeysStr = Object.keys(payload).reduce(
        (acc, cur) => `${acc}${cur}-`,
        ''
      );
      const payloadValuesStr = Object.values(payload).reduce(
        (acc, cur) => `${acc}${cur}-`,
        ''
      );
      const objStr = Object.keys(options).reduce(
        (acc, cur) => `${acc}${cur}`,
        ''
      );
      return `${payloadKeysStr}_${payloadValuesStr}_${objStr}`;
    });

  jwt.verify = jest.fn().mockImplementation((token: string) => {
    const tokenObjs = token.split('_');
    const tokenKeys = tokenObjs[0].split('-');
    const tokenValues = tokenObjs[1].split('-');

    return tokenKeys.reduce(
      (acc, cur, idx) => ({
        ...acc,
        ...(tokenValues[idx] !== '-' && {
          [cur]: tokenValues[idx],
        }),
      }),
      {}
    );
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

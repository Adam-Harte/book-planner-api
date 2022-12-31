import { faker } from '@faker-js/faker';

export const generateMockUser = () => ({
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(15, false, /^[A-Za-z0-9]*$/, '!?1'),
});

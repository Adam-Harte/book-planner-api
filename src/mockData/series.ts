import { faker } from '@faker-js/faker';

export const generateMockSeries = (user?: object) => ({
  name: faker.word.verb(),
  genre: faker.helpers.arrayElement(['fantasy', 'sci-fi', 'horror']),
  ...(user && { user }),
});

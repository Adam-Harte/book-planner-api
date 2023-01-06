import { faker } from '@faker-js/faker';

export const generateMockBook = (user?: object, series?: object) => ({
  name: faker.word.adjective(),
  genre: faker.helpers.arrayElement(['fantasy', 'sci-fi', 'horror']),
  ...(user && { user }),
  ...(series && { series }),
});

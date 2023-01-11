import { faker } from '@faker-js/faker';

export const generateMockWorld = (series?: object, books?: object[]) => ({
  name: faker.random.word(),
  description: faker.lorem.paragraphs(),
  ...(series && { series }),
  ...(books && { books }),
});

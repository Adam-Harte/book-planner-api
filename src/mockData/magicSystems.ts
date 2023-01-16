import { faker } from '@faker-js/faker';

export const generateMockMagicSystem = (series?: object, books?: object[]) => ({
  name: faker.word.noun(),
  description: faker.lorem.paragraphs(),
  rules: faker.lorem.paragraphs(),
  ...(series && { series }),
  ...(books && { books }),
});

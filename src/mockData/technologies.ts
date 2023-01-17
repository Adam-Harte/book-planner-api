import { faker } from '@faker-js/faker';

export const generateMockTechnology = (series?: object, books?: object[]) => ({
  name: faker.word.interjection(),
  description: faker.lorem.paragraphs(),
  inventor: faker.name.firstName(),
  ...(series && { series }),
  ...(books && { books }),
});

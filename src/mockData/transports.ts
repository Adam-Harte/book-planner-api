import { faker } from '@faker-js/faker';

export const generateMockTransport = (series?: object, books?: object[]) => ({
  name: faker.word.interjection(),
  description: faker.lorem.paragraphs(),
  ...(series && { series }),
  ...(books && { books }),
});

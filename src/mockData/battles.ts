import { faker } from '@faker-js/faker';

export const generateMockBattle = (series?: object, books?: object[]) => ({
  name: faker.word.interjection(),
  start: faker.date.month(),
  end: faker.date.month(),
  description: faker.lorem.paragraphs(),
  ...(series && { series }),
  ...(books && { books }),
});

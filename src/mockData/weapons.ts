import { faker } from '@faker-js/faker';

export const generateMockWeapon = (series?: object, books?: object[]) => ({
  name: faker.word.adjective(),
  description: faker.lorem.paragraphs(),
  creator: faker.name.firstName(),
  wielder: faker.name.firstName(),
  forged: faker.word.noun(),
  ...(series && { series }),
  ...(books && { books }),
});

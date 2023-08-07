import { faker } from '@faker-js/faker';

export const generateMockCreature = (series?: object, books?: object[]) => ({
  name: faker.name.firstName(),
  physicalDescription: faker.lorem.paragraphs(),
  personalityDescription: faker.lorem.paragraphs(),
  ...(series && { series }),
  ...(books && { books }),
});

import { faker } from '@faker-js/faker';

export const generateMockSetting = (series?: object, books?: object[]) => ({
  name: faker.random.word(),
  description: faker.lorem.paragraphs(),
  type: faker.helpers.arrayElement([
    'region',
    'city',
    'town',
    'village',
    'land',
    'building',
  ]),
  ...(series && { series }),
  ...(books && { books }),
});

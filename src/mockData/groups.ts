import { faker } from '@faker-js/faker';

export const generateMockGroup = (series?: object, books?: object[]) => ({
  name: faker.word.preposition(),
  type: faker.helpers.arrayElement([
    'army',
    'hunters',
    'companions',
    'rebels',
    'mercenaries',
    'bandits',
    'gang',
    'pirates',
    'faction',
    'slaves',
  ]),
  description: faker.lorem.paragraphs(),
  ...(series && { series }),
  ...(books && { books }),
});

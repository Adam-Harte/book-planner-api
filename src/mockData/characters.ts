import { faker } from '@faker-js/faker';

export const generateMockCharacter = (series?: object, books?: object[]) => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  title: faker.helpers.arrayElement([
    'mr',
    'master',
    'mrs',
    'miss',
    'commander',
    'lieutenant',
    'captain',
    'general',
    'admiral',
    'king',
    'queen',
    'prince',
    'princess',
    'lord',
    'lady',
    'count',
    'countess',
    'emperor',
    'empress',
  ]),
  type: faker.helpers.arrayElement([
    'main_protagonist',
    'main_antagonist',
    'protagonist',
    'antagonist',
    'anti_hero',
    'side_character',
    'minor_character',
  ]),
  age: faker.datatype.number({ min: 1, max: 100 }),
  physicalDescription: faker.lorem.paragraphs(),
  personalityDescription: faker.lorem.paragraphs(),
  ...(series && { series }),
  ...(books && { books }),
});

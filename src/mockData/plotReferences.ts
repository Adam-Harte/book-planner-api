import { faker } from '@faker-js/faker';

export const generateMockPlotReference = (series?: object, book?: object) => ({
  name: faker.word.noun(),
  type: faker.helpers.arrayElement([
    'magic_systems',
    'weapons',
    'battles',
    'groups',
    'creatures',
    'races',
    'families',
    'governments',
    'religions',
    'gods',
    'artifacts',
    'legends',
    'histories',
  ]),
  referenceId: faker.datatype.number({ max: 100 }),
  ...(series && { series }),
  ...(book && { book }),
});

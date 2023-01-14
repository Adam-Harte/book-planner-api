import { faker } from '@faker-js/faker';

export const generateMockPlot = (series?: object, book?: object) => ({
  name: faker.word.noun(),
  type: faker.helpers.arrayElement([
    'story_arc',
    'character_arc',
    'plot_twist',
  ]),
  description: faker.lorem.paragraphs(),
  ...(series && { series }),
  ...(book && { book }),
});

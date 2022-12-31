import { IMemoryDb, newDb } from 'pg-mem';
import { DataSource } from 'typeorm';

import { Artifacts } from './models/artifacts';
import { Battles } from './models/battles';
import { Books } from './models/books';
import { Characters } from './models/characters';
import { Creatures } from './models/creatures';
import { Families } from './models/families';
import { Gods } from './models/gods';
import { Governments } from './models/governments';
import { Groups } from './models/groups';
import { Histories } from './models/histories';
import { Languages } from './models/languages';
import { Legends } from './models/legends';
import { MagicSystems } from './models/magicSystems';
import { Maps } from './models/maps';
import { PlotReferences } from './models/plotReferences';
import { Plots } from './models/plots';
import { Races } from './models/races';
import { Religions } from './models/religions';
import { Series } from './models/series';
import { Settings } from './models/settings';
import { Songs } from './models/songs';
import { Technologies } from './models/technologies';
import { Transports } from './models/transports';
import { Users } from './models/users';
import { Weapons } from './models/weapons';
import { Worlds } from './models/worlds';

export const testDb: IMemoryDb = newDb({ autoCreateForeignKeyIndices: true });

export const setupTestDataSource = async () => {
  testDb.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  });

  testDb.public.registerFunction({
    implementation: () => 'test',
    name: 'version',
  });

  const testDataSource = await testDb.adapters.createTypeormDataSource({
    type: 'postgres',
    entities: [
      Users,
      Series,
      Books,
      Characters,
      Settings,
      Worlds,
      Plots,
      PlotReferences,
      MagicSystems,
      Weapons,
      Technologies,
      Transports,
      Battles,
      Groups,
      Creatures,
      Races,
      Languages,
      Songs,
      Families,
      Governments,
      Religions,
      Gods,
      Artifacts,
      Legends,
      Histories,
      Maps,
    ],
  });

  // Initialize datasource
  await testDataSource.initialize();
  // Create a schema
  await testDataSource.synchronize();

  return testDataSource;
};

export const destroyTestDataSource = (dataSource: DataSource) => {
  dataSource.destroy();
};

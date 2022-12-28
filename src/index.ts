import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
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
import { Technology } from './models/technology';
import { Transport } from './models/transport';
import { Users } from './models/users';
import { Weapons } from './models/weapons';
import { Worlds } from './models/worlds';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: parseInt(process.env.POSTGRES_PORT as string, 10),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
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
    Technology,
    Transport,
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
  migrations: [],
  synchronize: true,
  logging: false,
});

try {
  await AppDataSource.initialize();
  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
} catch (err) {
  console.log(err);
}

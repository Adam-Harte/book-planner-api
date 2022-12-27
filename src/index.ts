import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { DataSource } from 'typeorm';

import { Books } from './models/books';
import { Characters } from './models/characters';
import { Series } from './models/series';
import { Settings } from './models/settings';
import { Users } from './models/users';

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
  entities: [Users, Series, Books, Characters, Settings],
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

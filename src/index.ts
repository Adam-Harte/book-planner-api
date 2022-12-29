import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';

import { AppDataSource } from './dataSource';
import { authRouter } from './routes/auth';

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRouter);

try {
  await AppDataSource.initialize();
  console.log('Data source initialized');

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
} catch (err) {
  console.log('Data source not initialized due to errors', err);
}

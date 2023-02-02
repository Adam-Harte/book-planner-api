import 'reflect-metadata';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';

import { authRouter } from './routes/auth';
import { battlesRouter } from './routes/battles';
import { booksRouter } from './routes/books';
import { charactersRouter } from './routes/characters';
import { groupsRouter } from './routes/groups';
import { magicSystemsRouter } from './routes/magicSystems';
import { plotReferencesRouter } from './routes/plotReferences';
import { plotsRouter } from './routes/plots';
import { seriesRouter } from './routes/series';
import { settingsRouter } from './routes/settings';
import { technologiesRouter } from './routes/technologies';
import { transportsRouter } from './routes/transports';
import { weaponsRouter } from './routes/weapons';
import { worldsRouter } from './routes/worlds';

dotenv.config();

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRouter);
app.use('/api', seriesRouter);
app.use('/api', booksRouter);
app.use('/api', charactersRouter);
app.use('/api', settingsRouter);
app.use('/api', worldsRouter);
app.use('/api', plotsRouter);
app.use('/api', plotReferencesRouter);
app.use('/api', magicSystemsRouter);
app.use('/api', weaponsRouter);
app.use('/api', technologiesRouter);
app.use('/api', transportsRouter);
app.use('/api', battlesRouter);
app.use('/api', groupsRouter);

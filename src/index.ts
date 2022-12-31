import 'reflect-metadata';

import { app } from './app';
import { AppDataSource } from './dataSource';

try {
  await AppDataSource.initialize();
  console.log('Data source initialized');

  app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
  });
} catch (err) {
  console.log('Data source not initialized due to errors', err);
}

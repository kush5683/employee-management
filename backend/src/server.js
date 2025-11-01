import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectToDatabase } from './db/mongo.js';
import timeOffRoutes from './routes/timeOffRoutes.js';
import shiftsRoutes from './routes/shiftsRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

async function start() {
  await connectToDatabase();

  const app = express();
  app.use(cors({ origin: env.clientOrigin }));
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/time-off', timeOffRoutes);
  app.use('/shifts', shiftsRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});

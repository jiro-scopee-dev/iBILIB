import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { materialsRouter, filesRouter } from './routes/materials.routes';
import { researchRouter } from './routes/research.routes';
import { catalogRouter } from './routes/catalog.routes';

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically at /uploads (metadata + API streaming also available)
app.use('/uploads', express.static(env.uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'iBILIB API', time: new Date().toISOString() });
});

app.use('/api/materials', materialsRouter);
app.use('/api/research', researchRouter);
app.use('/api/files', filesRouter);
app.use('/api', catalogRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const port = env.port;
app.listen(port, () => {
  console.log(`iBILIB API listening on http://localhost:${port}`);
  console.log(`API base: http://localhost:${port}/api`);
  console.log(`Uploads directory: ${env.uploadDir}`);
});

export default app;


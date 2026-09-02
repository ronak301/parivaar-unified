import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

const origins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
if (!origins.includes('https://parivaardirectory.netlify.app')) {
  origins.push('https://parivaardirectory.netlify.app');
}
app.use(cors({
  origin: origins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', routes);

app.use(errorHandler);

export default app;

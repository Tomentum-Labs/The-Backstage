import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOrigins, env } from './config/env.js';
import { authRateLimiter } from './middleware/rate-limit.js';
import authRouter from './routes/auth.routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRateLimiter, authRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof Error && env.NODE_ENV !== 'production') {
    return res.status(500).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Internal server error' });
});

export default app;

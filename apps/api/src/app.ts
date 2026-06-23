import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3004';

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Jago Akademi Core API',
    version: '1.0.0',
  });
});

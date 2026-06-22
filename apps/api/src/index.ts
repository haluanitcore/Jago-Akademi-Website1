import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Jago Akademi Core API'
  });
});

app.listen(port, () => {
  console.log(`[server]: Jago Akademi API is running at http://localhost:${port}`);
});

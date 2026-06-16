import 'dotenv/config';
import express from 'express';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/user.js';

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: '1mb' }));
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/chat', chatRoutes);
app.use('/users', userRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on http://localhost:${port}`);
});

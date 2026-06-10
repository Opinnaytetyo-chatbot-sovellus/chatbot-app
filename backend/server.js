import express from 'express';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/user.js';

const app = express();

app.use(express.json());
app.use('/chat', chatRoutes);
app.use('/users', userRoutes);

app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});
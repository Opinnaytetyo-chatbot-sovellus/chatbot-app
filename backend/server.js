import express from 'express';
import chatRoutes from './routes/chat.js';

const app = express();

app.use(express.json());
app.use('/chat', chatRoutes);

app.listen(3000);
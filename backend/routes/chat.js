import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/messages/:conversationId', async (req, res) => {
  const [rows] = await db.execute(
    'SELECT * FROM messages WHERE conversation_id = ?',
    [req.params.conversationId]
  );

  res.json(rows);
});

export default router;
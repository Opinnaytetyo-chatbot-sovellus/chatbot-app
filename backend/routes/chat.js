import db from '../db.js'; 
import { Router } from 'express';

const router = Router();

router.get('/messages/:conversationId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM messages WHERE conversation_id = ?',
      [req.params.conversationId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tietokantavirhe' });
  }
});

export default router;
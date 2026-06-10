import { v4 as uuidv4 } from 'uuid';
import getDb from '../db.js';
import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Sähköposti puuttuu' });
  }

  const id = uuidv4();

  try {
    const db = await getDb();
    await db.execute(
      'INSERT INTO users (id, email) VALUES (?, ?)',
      [id, email]
    );

    res.json({ success: true, userId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tietokantavirhe' });
  }
});

export default router;
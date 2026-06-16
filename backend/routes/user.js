import { v4 as uuidv4 } from 'uuid';
import getDb from '../db.js';
import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  const { email, createNew } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Sähköposti puuttuu' });
  }

  try {
    const db = await getDb();

    const [existingRows] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    const userExists = Array.isArray(existingRows) && existingRows.length > 0;
    const existingUserId = userExists ? existingRows[0].id : null;

    if (createNew) {
      if (userExists) {
        res.status(400).json({ error: 'Käyttäjä on jo olemassa' });
        return;
      }

      const id = uuidv4();
      await db.execute(
        'INSERT INTO users (id, email) VALUES (?, ?)',
        [id, email]
      );

      res.json({ success: true, userId: id });
      return;
    }

    if (!userExists) {
      res.status(404).json({ error: 'Käyttäjää ei löydy' });
      return;
    }

    res.json({ success: true, userId: existingUserId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tietokantavirhe' });
  }
});

export default router;

import { Router } from 'express';
import { findOrCreateUser } from '../dataStore.js';

const router = Router();

router.post('/', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const createNew = Boolean(req.body?.createNew);

  if (!email) {
    return res.status(400).json({ error: 'Sähköposti puuttuu' });
  }

  try {
    const result = await findOrCreateUser(email, createNew);

    if (result.error) {
      res.status(result.status || 400).json({ error: result.error });
      return;
    }

    res.json({ success: true, userId: result.user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tietokantavirhe' });
  }
});

export default router;

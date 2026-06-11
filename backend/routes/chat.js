import express from 'express';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';
import { saveMessage } from './history.js';

const router = express.Router();
const defaultModel = process.env.OPENAI_MODEL || 'gpt-5.5';
const assistantInstructions = [
  'You are a helpful chatbot inside a school project app.',
  'Answer in the same language as the user unless they ask otherwise.',
  'Keep answers clear, friendly, and concise.',
].join(' ');

let openai;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing');
  }

  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openai;
}

function normalizeMessages(messages, fallbackMessage) {
  const source = Array.isArray(messages)
    ? messages
    : [{ role: 'user', content: fallbackMessage }];

  return source
    .filter((item) => {
      const roleIsValid = item?.role === 'user' || item?.role === 'assistant';
      const contentIsValid = typeof item?.content === 'string' && item.content.trim();

      return roleIsValid && contentIsValid;
    })
    .slice(-12)
    .map((item) => ({
      role: item.role,
      content: item.content.trim(),
    }));
}

async function askChatGPT(input) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: defaultModel,
    instructions: assistantInstructions,
    input,
  });

  const reply = response.output_text?.trim();

  if (!reply) {
    throw new Error('OpenAI did not return a text response');
  }

  return reply;
}

router.get('/messages/:conversationId', async (req, res) => {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT * FROM messages WHERE conversation_id = ?',
      [req.params.conversationId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

async function getGuestUserId(db) {
  const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', ['guest@local']);

  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0].id;
  }

  const guestUserId = uuidv4();
  await db.execute(
    'INSERT INTO users (id, email) VALUES (?, ?)',
    [guestUserId, 'guest@local']
  );
  return guestUserId;
}

async function ensureConversation(db, conversationId, userId) {
  const [rows] = await db.execute(
    'SELECT id FROM conversations WHERE id = ?',
    [conversationId]
  );

  if (Array.isArray(rows) && rows.length > 0) {
    return;
  }

  const ownerId = userId || (await getGuestUserId(db));
  await db.execute(
    'INSERT INTO conversations (id, user_id) VALUES (?, ?)',
    [conversationId, ownerId]
  );
}

router.post('/message', async (req, res) => {
  const input = normalizeMessages(req.body?.messages, req.body?.message);
  const conversationId = req.body?.conversationId || uuidv4();
  const userId = req.body?.userId;

  if (!input.length) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const db = await getDb();
    await ensureConversation(db, conversationId, userId);

    const userMessage = input[input.length - 1]?.content || req.body?.message || '';
    if (userMessage) {
      await saveMessage(conversationId, 'user', userMessage);
    }

    const reply = await askChatGPT(input);

    await saveMessage(conversationId, 'assistant', reply);
    res.json({ reply, conversationId });
  } catch (error) {
    console.error('OpenAI request failed:', error);
    const errorMessage = error instanceof Error ? error.message : '';

    if (errorMessage === 'OPENAI_API_KEY is missing') {
      res.status(500).json({ error: 'OPENAI_API_KEY is missing on the backend' });
      return;
    }

    res.status(502).json({ error: 'OpenAI request failed' });
  }
});

router.get('/history', async (req, res) => {
  const userId = req.query.userId;

  if (!userId || typeof userId !== 'string') {
    res.status(400).json({ error: 'userId is required' });
    return;
  }

  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT id, created_at FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;

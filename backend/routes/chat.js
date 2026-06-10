import express from 'express';
import OpenAI from 'openai';
import { getDb } from '../db.js';

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

router.post('/message', async (req, res) => {
  const input = normalizeMessages(req.body?.messages, req.body?.message);

  if (!input.length) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    const reply = await askChatGPT(input);
    res.json({ reply });
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

export default router;

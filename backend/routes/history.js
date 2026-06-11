import { getDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export async function saveMessage(conversationId, role, content) {
  try {
    const db = await getDb();
    await db.execute(
      'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
      [uuidv4(), conversationId, role, content]
    );
  } catch (error) {
    console.error('Failed to save message:', error);
    throw error;
  }
}

export async function getConversationHistory(conversationId, limit = 20) {
  try {
    const db = await getDb();
    const [rows] = await db.execute(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT ?',
      [conversationId, limit]
    );

    return rows.reverse();
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    throw error;
  }
}
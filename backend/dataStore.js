import { v4 as uuidv4 } from 'uuid';
import { getDb } from './db.js';

const memory = {
  users: new Map(),
  conversations: new Map(),
  messages: [],
};

let warnedAboutMemoryStore = false;

async function getOptionalDb() {
  try {
    return await getDb();
  } catch (error) {
    if (!warnedAboutMemoryStore) {
      console.warn('MySQL is unavailable; using in-memory development store.');
      warnedAboutMemoryStore = true;
    }
    return null;
  }
}

function getMemoryUserByEmail(email) {
  for (const user of memory.users.values()) {
    if (user.email === email) {
      return user;
    }
  }

  return null;
}

export async function findOrCreateUser(email, createNew) {
  const db = await getOptionalDb();

  if (db) {
    const [existingRows] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    const existingUser = Array.isArray(existingRows) && existingRows.length > 0
      ? existingRows[0]
      : null;

    if (createNew) {
      if (existingUser) {
        return { error: 'Käyttäjä on jo olemassa', status: 400 };
      }

      const id = uuidv4();
      await db.execute('INSERT INTO users (id, email) VALUES (?, ?)', [id, email]);
      return { user: { id, email } };
    }

    if (!existingUser) {
      return { error: 'Käyttäjää ei löydy', status: 404 };
    }

    return { user: { id: existingUser.id, email } };
  }

  const existingUser = getMemoryUserByEmail(email);

  if (createNew) {
    if (existingUser) {
      return { error: 'Käyttäjä on jo olemassa', status: 400 };
    }

    const user = { id: uuidv4(), email };
    memory.users.set(user.id, user);
    return { user };
  }

  if (!existingUser) {
    return { error: 'Käyttäjää ei löydy', status: 404 };
  }

  return { user: existingUser };
}

export async function getGuestUserId() {
  const result = await findOrCreateUser('guest@local', true);

  if (result.user) {
    return result.user.id;
  }

  const existing = await findOrCreateUser('guest@local', false);
  return existing.user?.id;
}

export async function ensureConversation(conversationId, userId) {
  const db = await getOptionalDb();

  if (db) {
    const [rows] = await db.execute(
      'SELECT id FROM conversations WHERE id = ?',
      [conversationId]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return;
    }

    const ownerId = userId || (await getGuestUserId());
    await db.execute(
      'INSERT INTO conversations (id, user_id) VALUES (?, ?)',
      [conversationId, ownerId]
    );
    return;
  }

  if (!memory.conversations.has(conversationId)) {
    memory.conversations.set(conversationId, {
      id: conversationId,
      user_id: userId || (await getGuestUserId()),
      created_at: new Date().toISOString(),
    });
  }
}

export async function saveMessage(conversationId, role, content) {
  const db = await getOptionalDb();

  if (db) {
    await db.execute(
      'INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)',
      [uuidv4(), conversationId, role, content]
    );
    return;
  }

  memory.messages.push({
    id: uuidv4(),
    conversation_id: conversationId,
    role,
    content,
    created_at: new Date().toISOString(),
  });
}

export async function listMessages(conversationId) {
  const db = await getOptionalDb();

  if (db) {
    const [rows] = await db.execute(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );
    return rows;
  }

  return memory.messages
    .filter((message) => message.conversation_id === conversationId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function listConversations(userId) {
  const db = await getOptionalDb();

  if (db) {
    const [rows] = await db.execute(
      'SELECT id, created_at FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [userId]
    );
    return rows;
  }

  return Array.from(memory.conversations.values())
    .filter((conversation) => conversation.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)
    .map(({ id, created_at }) => ({ id, created_at }));
}

export async function getConversationHistory(conversationId, limit = 20) {
  const rows = await listMessages(conversationId);
  return rows.slice(-limit).map(({ role, content }) => ({ role, content }));
}

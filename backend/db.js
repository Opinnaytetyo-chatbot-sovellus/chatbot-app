import mysql from 'mysql2/promise';

let db;

async function createDbConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'chatbotdb',
  });
}

export async function getDb() {
  if (db) {
    try {
      await db.execute('SELECT 1');
      return db;
    } catch (error) {
      console.warn('Existing DB connection closed, reconnecting:', error);
      db = undefined;
    }
  }

  db = await createDbConnection();
  return db;
}

export default getDb;

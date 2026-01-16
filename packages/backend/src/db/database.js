const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

const initDatabase = require('./migrations/init');

let database;

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

const connect = async () => {
  if (database) {
    return database;
  }

  return new Promise((resolve, reject) => {
    try {
      const fs = require('node:fs');

      if (fs.existsSync(DB_PATH)) {
        const stats = fs.statSync(DB_PATH);
        console.log('Database file size:', stats.size, 'bytes');

        const files = fs.readdirSync(__dirname);
        console.log('Files in db directory:', files.length);
      }

      database = new sqlite3.Database(DB_PATH, async (error) => {
        if (error) {
          console.error('Error connecting to database:', error);
          reject(error);
          return;
        }

        console.log('Connected to SQLite database');

        try {
          await initDatabase(database);
          console.log('Database initialized');
          resolve(database);
        } catch (error) {
          console.error('Error initializing database:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Failed to create database connection:', error);
      reject(error);
    }
  });
};

// Get database instance - throws error if not connected
const getDatabase = () => {
  if (!database) {
    throw new Error('Database not connected. Call connect() first.');
  }
  return database;
};

const closeConnection = () => {
  return new Promise((resolve, reject) => {
    if (!database) {
      resolve();
      return;
    }

    database.close((error) => {
      if (error) {
        console.error('Error closing database:', error);
        reject(error);
        return;
      }
      database = undefined;
      resolve();
    });
  });
};

module.exports = {
  connect,
  getDb: getDatabase,
  closeConnection
};

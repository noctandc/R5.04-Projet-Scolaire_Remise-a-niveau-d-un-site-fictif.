const initDatabase = (database) => {
  return new Promise((resolve, reject) => {
    database.serialize(() => {
      // Create Users table
      database.run(
        `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstname TEXT,
          lastname TEXT,
          username TEXT UNIQUE,
          password TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME
        )
      `,
        (error) => {
          if (error) {
            console.error('Error creating users table:', error);
            reject(error);
          }
        }
      );

      // Create Products table
      database.run(
        `
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          price REAL DEFAULT 0,
          stock INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT (datetime('now')),
          updated_at DATETIME
        )
      `,
        (error) => {
          if (error) {
            console.error('Error creating products table:', error);
            reject(error);
          }
        }
      );

      // Add sample data if tables are empty
      database.get('SELECT COUNT(*) as count FROM users', [], (error, result) => {
        if (error) {
          console.error('Error checking users:', error);
          reject(error);
          return;
        }

        if (result.count === 0) {
          const bcrypt = require('bcryptjs');
          const hashedPassword = bcrypt.hashSync('admin123', 8);

          database.run(
            `
            INSERT INTO users (firstname, lastname, username, password)
            VALUES (?, ?, ?, ?)
          `,
            ['Admin', 'User', 'admin', hashedPassword],
            (error) => {
              if (error) {
                console.error('Error creating admin user:', error);
                reject(error);
              }
            }
          );
        }
      });

      database.get('SELECT COUNT(*) as count FROM products', [], (error, result) => {
        if (error) {
          console.error('Error checking products:', error);
          reject(error);
          return;
        }

        if (result.count === 0) {
          const sampleProducts = [
            ['Laptop', 999.99, 10],
            ['Smartphone', 499.99, 15],
            ['Headphones', 79.99, 20]
          ];

          for (const [name, price, stock] of sampleProducts) {
            database.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', [name, price, stock], (error) => {
              if (error) console.error('Error inserting product:', name, error);
            });
          }
        }
      });

      resolve();
    });
  });
};

module.exports = initDatabase;

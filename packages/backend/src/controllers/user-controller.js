const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const database_ = require('../db/database');

exports.registerUser = (request, response) => {
  const { username, password, firstname, lastname } = request.body;

  const hashedPassword = bcrypt.hashSync(password, 8);

  const database = database_.getDb();

  database.run(
    `INSERT INTO users (username, password, firstname, lastname) VALUES (?, ?, ?, ?)`,
    [username, hashedPassword, firstname, lastname],
    function (error) {
      if (error) {
        console.error(error);
        return response.status(500).json({ error: 'Error creating user' });
      }

      const token = jwt.sign({ id: this.lastID }, 'your-super-secret-key-that-should-not-be-hardcoded', {
        expiresIn: 86_400
      });

      response.status(201).json({ auth: true, token });
    }
  );
};

exports.loginUser = (request, response) => {
  const { username, password } = request.body;

  const database = database_.getDb();

  database.get(`SELECT * FROM users WHERE username = ?`, [username], (error, user) => {
    if (error) return response.status(500).json({ error: 'Error on the server.' });
    if (!user) return response.status(404).json({ error: 'No user found.' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return response.status(401).json({ auth: false, token: undefined });

    const token = jwt.sign({ id: user.id }, 'your-super-secret-key-that-should-not-be-hardcoded', { expiresIn: 86_400 });

    response.status(200).json({
      auth: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  });
};

exports.getAllUsers = (request, response) => {
  const database = database_.getDb();

  database.all(`SELECT id, username, firstname, lastname, created_at FROM users`, [], (error, users) => {
    if (error) {
      console.error(error);
      return response.status(500).json({ error: 'Error getting users' });
    }
    response.json(users);
  });
};

exports.findSimilarUsernames = (request, response) => {
  const database = database_.getDb();

  database.all('SELECT username FROM users', [], (error, users) => {
    if (error) return response.status(500).json({ error: error.message });

    const similar = [];

    for (let index = 0; index < users.length; index++) {
      for (let index_ = index + 1; index_ < users.length; index_++) {
        const username1 = users[index].username.toLowerCase();
        const username2 = users[index_].username.toLowerCase();

        const matrix = [];
        for (let x = 0; x <= username1.length; x++) {
          matrix[x] = [x];
        }
        for (let y = 0; y <= username2.length; y++) {
          matrix[0][y] = y;
        }

        for (let x = 1; x <= username1.length; x++) {
          for (let y = 1; y <= username2.length; y++) {
            matrix[x][y] = username1.charAt(x - 1) === username2.charAt(y - 1) ? matrix[x - 1][y - 1] : Math.min(matrix[x - 1][y - 1] + 1, matrix[x][y - 1] + 1, matrix[x - 1][y] + 1);
          }
        }

        const distance = matrix[username1.length][username2.length];
        if (distance <= 2) {
          similar.push({ user1: users[index].username, user2: users[index_].username, distance });
        }
      }
    }

    response.json({ similar, totalComparisons: (users.length * (users.length - 1)) / 2 });
  });
};

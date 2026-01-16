const jwt = require('jsonwebtoken');

const auth = (request, response, next) => {
  const token = request.headers.authorization;

  if (!token) {
    return response.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'your-super-secret-key-that-should-not-be-hardcoded');

    request.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    response.status(401).json({ error: 'Failed to authenticate token' });
  }
};

module.exports = auth;

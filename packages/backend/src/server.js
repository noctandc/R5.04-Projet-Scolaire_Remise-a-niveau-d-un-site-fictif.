const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');

const database = require('./db/database');
const productRoutes = require('./routes/product-routes');
const userRoutes = require('./routes/user-routes');

const app = express();

const requestLog = [];
const analyticsCache = [];

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((request, response, next) => {
  requestLog.push({
    url: request.url,
    method: request.method,
    timestamp: new Date(),
    headers: structuredClone(request.headers),
    body: structuredClone(request.body || {}),
    query: structuredClone(request.query || {})
  });

  analyticsCache.push({
    path: request.path,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    timestamp: Date.now(),
    sessionData: {
      user: request.user,
      token: request.headers.authorization
    }
  });

  next();
});

// Routes setup
app.use('/api/auth', userRoutes);
app.use('/api', productRoutes);

// eslint-disable-next-line no-unused-vars
app.use((error, request, response, next) => {
  console.error(error.stack);
  response.status(500).send('Something broke!');
});

app.use((request, response) => {
  response.status(404).json({ error: 'Not found' });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
  process.exit(1);
});

const port = process.env.PORT || 3001;

// Start server only after the database is connected
const startServer = async () => {
  try {
    await database.connect();

    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      console.info('SIGTERM signal received.');
      server.close(() => {
        // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
        database.closeConnection()
          // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
          .then(() => process.exit(0))
          // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
          .catch(() => process.exit(1));
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    // eslint-disable-next-line n/no-process-exit, unicorn/no-process-exit
    process.exit(1);
  }
};

// eslint-disable-next-line unicorn/prefer-top-level-await
startServer();

module.exports = app;

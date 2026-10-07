const { Server } = require('socket.io');
const { initChatSocket, isUserOnline, checkRateLimit } = require('./chatSocket');

let ioInstance = null;

const initSockets = (httpServer) => {
  const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  const allowedOrigins = [
    ...configuredOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ];

  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isExplicitlyAllowed = allowedOrigins.includes(origin);
        const isVercelDomain = /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin);
        const isDevLocalhost = process.env.NODE_ENV !== 'production' && origin.includes('localhost');

        if (isExplicitlyAllowed || isVercelDomain || isDevLocalhost) {
          return callback(null, true);
        }
        callback(new Error(`Origin ${origin} not allowed by Socket.IO CORS policy`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT']
    },
    pingTimeout: 30000,
    pingInterval: 25000
  });

  initChatSocket(io);
  ioInstance = io;

  return io;
};

const getIO = () => {
  return ioInstance;
};

module.exports = {
  initSockets,
  getIO,
  isUserOnline,
  checkRateLimit
};

const { Server } = require('socket.io');

let ioInstance = null;

const parseAllowedOrigins = () => {
  const defaults = [
    'http://localhost:5173',
    'https://smartparking.com',
    'https://car-parking-rouge-seven.vercel.app',
  ];

  const fromEnv = (process.env.SOCKET_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return [...new Set([...defaults, ...fromEnv])];
};

const isOriginAllowed = (origin, allowedOrigins) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return origin.endsWith('.vercel.app');
};

const initSocket = (httpServer) => {
  if (ioInstance) return ioInstance;

  const allowedOrigins = parseAllowedOrigins();

  ioInstance = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin, allowedOrigins)) {
          return callback(null, true);
        }
        return callback(new Error(`Socket origin not allowed: ${origin}`));
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  ioInstance.on('connection', (socket) => {
    console.log('Socket client connected:', socket.id);

    socket.emit('socket:ready', {
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    socket.on('ping', (payload) => {
      socket.emit('pong', {
        ok: true,
        payload: payload ?? null,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket client disconnected:', socket.id, reason);
    });

    socket.on('error', (error) => {
      console.error('Socket client error:', socket.id, error?.message || error);
    });
  });

  ioInstance.engine.on('connection_error', (error) => {
    console.error('Socket connection error:', error?.message || error);
  });

  return ioInstance;
};

const getIo = () => ioInstance;

const emitSlotUpdate = (payload) => {
  if (!ioInstance) {
    console.warn('Socket emit skipped because socket server is not initialized yet.');
    return false;
  }

  ioInstance.emit('slot:update', {
    ...payload,
    slotId: payload?.slotId?.toString?.() || payload?.slotId || null,
    timestamp: new Date().toISOString(),
  });

  return true;
};

module.exports = {
  emitSlotUpdate,
  getIo,
  initSocket,
  isOriginAllowed,
  parseAllowedOrigins,
};

require('dotenv').config();
const http = require('http');
const createApp = require('./server');
const { initSocket } = require('./app/socket/socket');

const app = createApp();
const PORT = process.env.PORT || 3000;

// tạo http server
const server = http.createServer(app);

initSocket(server);

// chạy server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

/* require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./server');

const app = createApp();
const PORT = process.env.PORT || 3000;

// tạo http server
const server = http.createServer(app);

// khởi tạo socket
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// gán global để API dùng được
global.io = io;

// khi client connect
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// chạy server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});*/

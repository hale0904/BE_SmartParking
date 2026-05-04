const path = require('path');
const cors = require('cors');
const express = require('express');
const connectDB = require('./app/config/db.config');
const routes = require('./app/routes/routes');

require('./app/cron/booking.cron');

function createApp() {
  const app = express();

  // ===== CONNECT DB =====
  connectDB();

  // ===== CORS CONFIG =====
  const allowedOrigins = [
    'http://localhost:5173',
    'https://smartparking.com',
    'https://car-parking-rouge-seven.vercel.app',
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // cho phép Postman / mobile (không có origin)
        if (!origin) return callback(null, true);

        // cho phép domain trong whitelist
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // cho phép tất cả domain vercel (preview deploy)
        if (origin.endsWith('.vercel.app')) {
          return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ===== MIDDLEWARE =====
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  // ===== ROUTES =====
  app.use('/', routes);

  return app;
}

module.exports = createApp;

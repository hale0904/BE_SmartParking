const path = require('path');
const cors = require('cors');
const express = require('express');
const connectDB = require('./c-app/c-config/db.config');
const routes = require('./c-app/c-routes/routes');

function createApp() {
  const app = express();

  // ===== CONNECT DB =====
  connectDB();

  // Cors
  app.use(
    cors({
      origin: ['http://localhost:5173', 'https://smartparking.com'],
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

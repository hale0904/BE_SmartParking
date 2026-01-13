const path = require('path');
const express = require('express');
const connectDB = require('./c-app/c-config/db.config');
const routes = require('./c-app/c-routes/routes');

function createApp() {
  const app = express();

  // ===== CONNECT DB =====
  connectDB();

  // ===== MIDDLEWARE =====
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  // ===== ROUTES =====
  app.use('/', routes);

  return app;
}

module.exports = createApp;

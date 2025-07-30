require('dotenv').config();
const { setupServer } = require('./server');
const { initMongoConnection } = require('./db/initMongoConnection');

const start = async () => {
  await initMongoConnection();
  setupServer();
};

start();

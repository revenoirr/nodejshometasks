const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  dataDirectory: path.join(__dirname, '../data'),
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
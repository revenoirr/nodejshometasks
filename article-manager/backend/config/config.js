const path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  dataDirectory: path.join(__dirname, '../data'),
  uploadsDirectory: path.join(__dirname, '../uploads'),
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  upload: {
    maxFileSize: 10 * 1024 * 1024, 
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf']
  }
};
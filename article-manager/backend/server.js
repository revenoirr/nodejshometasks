const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('./config/config');
const articleRoutes = require('./routes/articles');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { ensureDirectoryExists } = require('./utils/fileUtils');
const { initWebSocket } = require('./websocket/websocketServer');

const app = express();
const server = http.createServer(app);
const PORT = config.port;

app.use(cors(config.cors));
app.use(express.json());

app.use('/uploads', express.static(config.uploadsDirectory));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/articles', articleRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);

app.use(errorHandler);

const startServer = async () => {
  try {
    await ensureDirectoryExists(config.dataDirectory);
    await ensureDirectoryExists(config.uploadsDirectory);

    initWebSocket(server);
    
    server.listen(PORT, () => {
      console.log('=================================');
      console.log(`✅ Server running successfully!`);
      console.log(`📍 HTTP: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`📁 Data: ${config.dataDirectory}`);
      console.log(`📎 Uploads: ${config.uploadsDirectory}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=================================');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
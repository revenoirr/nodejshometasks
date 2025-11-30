const express = require('express');
const http = require('http');
const cors = require('cors');
const config = require('./config/config');
const db = require('./models');
const articleRoutes = require('./routes/articles');
const workspaceRoutes = require('./routes/workspaces');  // Add this
const commentRoutes = require('./routes/comments');      // Add this
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { ensureDirectoryExists } = require('./utils/fileUtils');
const { initWebSocket } = require('./websocket/websocketServer');

const app = express();
const server = http.createServer(app);
const PORT = config.port;

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use('/uploads', express.static(config.uploadsDirectory));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ROUTES - MUST BE BEFORE ERROR HANDLERS
app.use('/articles', articleRoutes);
app.use('/workspaces', workspaceRoutes);  // Move here
app.use('/comments', commentRoutes);      // Move here

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected',
      timestamp: new Date().toISOString() 
    });
  }
});

// ERROR HANDLERS - MUST BE LAST
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Checking database schema...');
      await db.sequelize.sync({ alter: false });
      console.log('✅ Database schema is up to date');
    }

    await ensureDirectoryExists(config.uploadsDirectory);
    initWebSocket(server);
    
    server.listen(PORT, () => {
      console.log('=================================');
      console.log(`✅ Server running successfully!`);
      console.log(`📍 HTTP: http://localhost:${PORT}`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`💾 Database: ${db.sequelize.config.database}`);
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
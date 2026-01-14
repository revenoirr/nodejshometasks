const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const db = require('./models');
const config = require('./config/config');
const { initWebSocket } = require('./websocket/websocketServer');

const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/authMiddleware');

const articleRoutes = require('./routes/articles');
const commentRoutes = require('./routes/comments');
const workspaceRoutes = require('./routes/workspaces');
const authRoutes = require('./routes/auth');
const userManagementRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

initWebSocket(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(config.uploadsDirectory || path.join(__dirname, 'uploads')));

app.use('/auth', authRoutes);

app.use('/articles', authMiddleware, articleRoutes);
app.use('/comments', authMiddleware, commentRoutes);
app.use('/workspaces', authMiddleware, workspaceRoutes);
app.use('/users', userManagementRoutes); 

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established successfully.');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${config.uploadsDirectory || path.join(__dirname, 'uploads')}`);
      console.log(`🔒 Protected routes require JWT authentication`);
      console.log(`👮 Admin routes: /users/* (requires admin role)`);
    });
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = { app, server };
const express = require('express');
const cors = require('cors');
const config = require('./config/config');
const articleRoutes = require('./routes/articles');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { ensureDirectoryExists } = require('./utils/fileUtils');

const app = express();
const PORT = config.port;

app.use(cors(config.cors));
app.use(express.json());

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
    
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`✅ Server running successfully!`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`📁 Data directory: ${config.dataDirectory}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=================================');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
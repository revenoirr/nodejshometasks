const WebSocket = require('ws');

let wss = null;

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('✅ New WebSocket client connected');

    ws.on('message', (message) => {
      console.log('Received:', message.toString());
    });

    ws.on('close', () => {
      console.log('❌ WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Article Management System'
    }));
  });

  return wss;
};

const broadcast = (data) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const notifyArticleCreated = (article) => {
  broadcast({
    type: 'article_created',
    message: `New article created: "${article.title}"`,
    data: article,
    timestamp: new Date().toISOString()
  });
};

const notifyArticleUpdated = (article) => {
  broadcast({
    type: 'article_updated',
    message: `Article updated: "${article.title}"`,
    data: article,
    timestamp: new Date().toISOString()
  });
};

const notifyArticleDeleted = (articleId, title) => {
  broadcast({
    type: 'article_deleted',
    message: `Article deleted: "${title}"`,
    data: { id: articleId },
    timestamp: new Date().toISOString()
  });
};

const notifyFileAttached = (articleId, filename, title) => {
  broadcast({
    type: 'file_attached',
    message: `File "${filename}" attached to article: "${title}"`,
    data: { articleId, filename },
    timestamp: new Date().toISOString()
  });
};

const notifyFileDeleted = (articleId, filename, title) => {
  broadcast({
    type: 'file_deleted',
    message: `File "${filename}" removed from article: "${title}"`,
    data: { articleId, filename },
    timestamp: new Date().toISOString()
  });
};

// Add these notification functions:

const notifyWorkspaceCreated = (workspace) => {
  broadcast({
    type: 'workspace_created',
    message: `New workspace "${workspace.name}" created`,
    data: workspace,
    timestamp: new Date().toISOString()
  });
};

const notifyWorkspaceUpdated = (workspace) => {
  broadcast({
    type: 'workspace_updated',
    message: `Workspace "${workspace.name}" updated`,
    data: workspace,
    timestamp: new Date().toISOString()
  });
};

const notifyWorkspaceDeleted = (workspaceName) => {
  broadcast({
    type: 'workspace_deleted',
    message: `Workspace "${workspaceName}" deleted`,
    data: { name: workspaceName },
    timestamp: new Date().toISOString()
  });
};

const notifyCommentAdded = (comment, articleTitle) => {
  broadcast({
    type: 'comment_added',
    message: `${comment.authorName} commented on "${articleTitle}"`,
    data: comment,
    timestamp: new Date().toISOString()
  });
};

const notifyCommentUpdated = (comment) => {
  broadcast({
    type: 'comment_updated',
    message: `Comment updated`,
    data: comment,
    timestamp: new Date().toISOString()
  });
};

const notifyCommentDeleted = (commentId) => {
  broadcast({
    type: 'comment_deleted',
    message: `Comment deleted`,
    data: { id: commentId },
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  initWebSocket,
  notifyArticleCreated,
  notifyArticleUpdated,
  notifyArticleDeleted,
  notifyFileAttached,
  notifyFileDeleted,
  initWebSocket,
  notifyArticleCreated,
  notifyArticleUpdated,
  notifyArticleDeleted,
  notifyFileAttached,
  notifyFileDeleted,
  notifyWorkspaceCreated,
  notifyWorkspaceUpdated,
  notifyWorkspaceDeleted,
  notifyCommentAdded,
  notifyCommentUpdated,
  notifyCommentDeleted
};
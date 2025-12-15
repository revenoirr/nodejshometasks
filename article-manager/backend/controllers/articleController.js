const articleService = require('../services/articleService');
const { 
  notifyArticleCreated, 
  notifyArticleUpdated, 
  notifyArticleDeleted,
  notifyFileAttached,
  notifyFileDeleted
} = require('../websocket/websocketServer');

const getAllArticles = async (req, res) => {
  try {
    const articles = await articleService.getAllArticles();
    res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ error: 'Failed to retrieve articles' });
  }
};

const getArticleById = async (req, res) => {
  try {
    const versionNumber = req.query.version ? parseInt(req.query.version) : null;
    const article = await articleService.getArticleById(req.params.id, versionNumber);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    if (err.message === 'Article not found' || err.message === 'Version not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to retrieve article' });
  }
};

const getArticleVersions = async (req, res) => {
  try {
    const versions = await articleService.getArticleVersions(req.params.id);
    res.json(versions);
  } catch (err) {
    console.error('Error fetching article versions:', err);
    if (err.message === 'Article not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to retrieve article versions' });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content, workspaceId } = req.body;
    const result = await articleService.createArticle(title, content, workspaceId);
    
    notifyArticleCreated({ id: result.id, title: result.title });
    
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating article:', err);
    if (err.message === 'Workspace not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create article' });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { title, content, workspaceId } = req.body;
    const result = await articleService.updateArticle(req.params.id, title, content, workspaceId);
    
    notifyArticleUpdated({ id: result.id, title: result.title, version: result.version });
    
    res.json(result);
  } catch (err) {
    console.error('Error updating article:', err);
    if (err.message === 'Article not found' || err.message === 'Workspace not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update article' });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const result = await articleService.deleteArticle(req.params.id);
    
    notifyArticleDeleted(req.params.id, result.title);
    
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    if (err.message === 'Article not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await articleService.addAttachment(req.params.id, req.file);
    
    notifyFileAttached(req.params.id, result.attachment.originalName, result.title);
    
    res.status(201).json(result);
  } catch (err) {
    console.error('Error uploading attachment:', err);
    if (err.message === 'Article not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const result = await articleService.deleteAttachment(req.params.id, req.params.attachmentId);
    
    notifyFileDeleted(req.params.id, result.filename, result.title);
    
    res.json({ message: 'Attachment deleted successfully' });
  } catch (err) {
    console.error('Error deleting attachment:', err);
    if (err.message === 'Article not found' || err.message === 'Attachment not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to delete attachment' });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  getArticleVersions,
  createArticle,
  updateArticle,
  deleteArticle,
  uploadAttachment,
  deleteAttachment
};
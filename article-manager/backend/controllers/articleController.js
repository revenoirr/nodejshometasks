const articleService = require('../services/articleService');

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
    const article = await articleService.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    if (err.message === 'Article not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to retrieve article' });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const result = await articleService.createArticle(title, content);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating article:', err);
    if (err.message === 'Article with similar title already exists') {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create article' });
  }
};

const updateArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const result = await articleService.updateArticle(req.params.id, title, content);
    res.json(result);
  } catch (err) {
    console.error('Error updating article:', err);
    if (err.message === 'Article not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update article' });
  }
};

const deleteArticle = async (req, res) => {
  try {
    await articleService.deleteArticle(req.params.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    if (err.message === 'Article not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to delete article' });
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
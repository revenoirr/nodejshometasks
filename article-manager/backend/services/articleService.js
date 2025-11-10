const fs = require('fs').promises;
const path = require('path');
const { generateFilename, getArticleFiles } = require('../utils/fileUtils');
const config = require('../config/config');

const DATA_DIR = config.dataDirectory;

const getAllArticles = async () => {
  const files = await getArticleFiles(DATA_DIR);
  const articles = await Promise.all(
    files.map(async (file) => {
      const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
      const article = JSON.parse(content);
      return {
        id: file.replace('.json', ''),
        title: article.title,
        createdAt: article.createdAt
      };
    })
  );
  return articles;
};

const getArticleById = async (id) => {
  const filename = `${id}.json`;
  const filepath = path.join(DATA_DIR, filename);
  
  try {
    await fs.access(filepath);
  } catch {
    throw new Error('Article not found');
  }

  const content = await fs.readFile(filepath, 'utf-8');
  const article = JSON.parse(content);
  return { id, ...article };
};

const createArticle = async (title, content) => {
  const filename = generateFilename(title);
  const filepath = path.join(DATA_DIR, filename);

  try {
    await fs.access(filepath);
    throw new Error('Article with similar title already exists');
  } catch (err) {
    if (err.message === 'Article with similar title already exists') {
      throw err;
    }
  }

  const article = {
    title,
    content,
    createdAt: new Date().toISOString()
  };

  await fs.writeFile(filepath, JSON.stringify(article, null, 2));
  
  return { 
    id: filename.replace('.json', ''),
    message: 'Article created successfully' 
  };
};

const updateArticle = async (id, title, content) => {
  const filename = `${id}.json`;
  const filepath = path.join(DATA_DIR, filename);

  try {
    await fs.access(filepath);
  } catch {
    throw new Error('Article not found');
  }

  const existingContent = await fs.readFile(filepath, 'utf-8');
  const existingArticle = JSON.parse(existingContent);

  const updatedArticle = {
    title,
    content,
    createdAt: existingArticle.createdAt,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(filepath, JSON.stringify(updatedArticle, null, 2));
  
  return { 
    id,
    message: 'Article updated successfully' 
  };
};

const deleteArticle = async (id) => {
  const filename = `${id}.json`;
  const filepath = path.join(DATA_DIR, filename);

  try {
    await fs.access(filepath);
  } catch {
    throw new Error('Article not found');
  }

  await fs.unlink(filepath);
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
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
        createdAt: article.createdAt,
        attachments: article.attachments || []
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
    attachments: [],
    createdAt: new Date().toISOString()
  };

  await fs.writeFile(filepath, JSON.stringify(article, null, 2));
  
  return { 
    id: filename.replace('.json', ''),
    title,
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
    attachments: existingArticle.attachments || [],
    createdAt: existingArticle.createdAt,
    updatedAt: new Date().toISOString()
  };

  await fs.writeFile(filepath, JSON.stringify(updatedArticle, null, 2));
  
  return { 
    id,
    title,
    message: 'Article updated successfully' 
  };
};

const deleteArticle = async (id) => {
  const filename = `${id}.json`;
  const filepath = path.join(DATA_DIR, filename);

  let article;
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    article = JSON.parse(content);
  } catch {
    throw new Error('Article not found');
  }

  // Delete all attachments
  if (article.attachments && article.attachments.length > 0) {
    for (const attachment of article.attachments) {
      const attachmentPath = path.join(config.uploadsDirectory, attachment.filename);
      try {
        await fs.unlink(attachmentPath);
      } catch (err) {
        console.error(`Failed to delete attachment: ${attachment.filename}`);
      }
    }
  }

  await fs.unlink(filepath);
  return { title: article.title };
};

const addAttachment = async (id, fileInfo) => {
  const filename = `${id}.json`;
  const filepath = path.join(DATA_DIR, filename);

  try {
    await fs.access(filepath);
  } catch {
    throw new Error('Article not found');
  }

  const content = await fs.readFile(filepath, 'utf-8');
  const article = JSON.parse(content);

  if (!article.attachments) {
    article.attachments = [];
  }

  const attachment = {
    id: Date.now().toString(),
    filename: fileInfo.filename,
    originalName: fileInfo.originalname,
    mimetype: fileInfo.mimetype,
    size: fileInfo.size,
    uploadedAt: new Date().toISOString()
  };

  article.attachments.push(attachment);
  await fs.writeFile(filepath, JSON.stringify(article, null, 2));

  return { 
    attachment,
    title: article.title,
    message: 'File attached successfully' 
  };
};

const deleteAttachment = async (id, attachmentId) => {
  const filename = `${id}.json`;
  const filepath = path.join(DATA_DIR, filename);

  try {
    await fs.access(filepath);
  } catch {
    throw new Error('Article not found');
  }

  const content = await fs.readFile(filepath, 'utf-8');
  const article = JSON.parse(content);

  if (!article.attachments) {
    throw new Error('Attachment not found');
  }

  const attachmentIndex = article.attachments.findIndex(a => a.id === attachmentId);
  if (attachmentIndex === -1) {
    throw new Error('Attachment not found');
  }

  const attachment = article.attachments[attachmentIndex];
  const attachmentPath = path.join(config.uploadsDirectory, attachment.filename);

  try {
    await fs.unlink(attachmentPath);
  } catch (err) {
    console.error(`Failed to delete file: ${attachment.filename}`);
  }

  article.attachments.splice(attachmentIndex, 1);
  await fs.writeFile(filepath, JSON.stringify(article, null, 2));

  return { 
    filename: attachment.originalName,
    title: article.title,
    message: 'Attachment deleted successfully' 
  };
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  addAttachment,
  deleteAttachment
};
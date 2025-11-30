const fs = require('fs').promises;
const path = require('path');
const db = require('../models');
const config = require('../config/config');

const { Article, Attachment } = db;

const getAllArticles = async () => {
  const articles = await Article.findAll({
    attributes: ['id', 'title', 'slug', 'createdAt', 'updatedAt'],
    include: [{
      model: Attachment,
      as: 'attachments',
      attributes: ['id', 'originalName', 'mimetype', 'size']
    }],
    order: [['createdAt', 'DESC']]
  });

  return articles.map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    attachmentCount: article.attachments.length
  }));
};

const getArticleById = async (id) => {
  const article = await Article.findByPk(id, {
    include: [{
      model: Attachment,
      as: 'attachments',
      attributes: ['id', 'filename', 'originalName', 'mimetype', 'size', 'path', 'createdAt'],
      order: [['createdAt', 'ASC']]
    }]
  });

  if (!article) {
    throw new Error('Article not found');
  }

  return {
    id: article.id,
    title: article.title,
    content: article.content,
    slug: article.slug,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    attachments: article.attachments.map(att => ({
      id: att.id,
      filename: att.filename,
      originalName: att.originalName,
      mimetype: att.mimetype,
      size: att.size,
      uploadedAt: att.createdAt
    }))
  };
};

const createArticle = async (title, content) => {
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;

  while (await Article.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const article = await Article.create({
    title,
    content,
    slug
  });

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    message: 'Article created successfully'
  };
};

const updateArticle = async (id, title, content) => {
  const article = await Article.findByPk(id);

  if (!article) {
    throw new Error('Article not found');
  }

  let slug = article.slug;
  if (title !== article.title) {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    slug = baseSlug;
    let counter = 1;

    while (await Article.findOne({ where: { slug, id: { [db.Sequelize.Op.ne]: id } } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  await article.update({
    title,
    content,
    slug
  });

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    message: 'Article updated successfully'
  };
};

const deleteArticle = async (id) => {
  const article = await Article.findByPk(id, {
    include: [{
      model: Attachment,
      as: 'attachments'
    }]
  });

  if (!article) {
    throw new Error('Article not found');
  }

  if (article.attachments && article.attachments.length > 0) {
    for (const attachment of article.attachments) {
      const attachmentPath = path.join(config.uploadsDirectory, attachment.filename);
      try {
        await fs.unlink(attachmentPath);
      } catch (err) {
        console.error(`Failed to delete file: ${attachment.filename}`, err);
      }
    }
  }

  await article.destroy();

  return { title: article.title };
};

const addAttachment = async (id, fileInfo) => {
  const article = await Article.findByPk(id);

  if (!article) {
    throw new Error('Article not found');
  }

  const attachment = await Attachment.create({
    articleId: id,
    filename: fileInfo.filename,
    originalName: fileInfo.originalname,
    mimetype: fileInfo.mimetype,
    size: fileInfo.size,
    path: `/uploads/${fileInfo.filename}`
  });

  return {
    attachment: {
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimetype: attachment.mimetype,
      size: attachment.size,
      uploadedAt: attachment.createdAt
    },
    title: article.title,
    message: 'File attached successfully'
  };
};

const deleteAttachment = async (articleId, attachmentId) => {
  const article = await Article.findByPk(articleId);

  if (!article) {
    throw new Error('Article not found');
  }

  const attachment = await Attachment.findOne({
    where: {
      id: attachmentId,
      articleId: articleId
    }
  });

  if (!attachment) {
    throw new Error('Attachment not found');
  }

  const attachmentPath = path.join(config.uploadsDirectory, attachment.filename);

  try {
    await fs.unlink(attachmentPath);
  } catch (err) {
    console.error(`Failed to delete file: ${attachment.filename}`, err);
  }

  
  await attachment.destroy();

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
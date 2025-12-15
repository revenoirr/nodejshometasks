const fs = require('fs').promises;
const path = require('path');
const db = require('../models');
const config = require('../config/config');

const { Article, ArticleVersion, Attachment, Workspace, Comment } = db;

const getAllArticles = async (workspaceId = null) => {
  const where = workspaceId ? { workspaceId } : {};
  
  const articles = await Article.findAll({
    where,
    attributes: ['id', 'title', 'slug', 'workspaceId', 'createdAt', 'updatedAt'],
    include: [
      {
        model: Attachment,
        as: 'attachments',
        attributes: ['id', 'originalName', 'mimetype', 'size']
      },
      {
        model: Workspace,
        as: 'workspace',
        attributes: ['id', 'name', 'slug', 'color', 'icon']
      },
      {
        model: Comment,
        as: 'comments',
        attributes: ['id']
      },
      {
        model: ArticleVersion,
        as: 'versions',
        attributes: ['versionNumber'],
        separate: true,
        order: [['versionNumber', 'DESC']],
        limit: 1
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  return articles.map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    workspace: article.workspace ? {
      id: article.workspace.id,
      name: article.workspace.name,
      slug: article.workspace.slug,
      color: article.workspace.color,
      icon: article.workspace.icon
    } : null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    attachmentCount: article.attachments.length,
    commentCount: article.comments.length,
    currentVersion: article.versions.length > 0 ? article.versions[0].versionNumber : 1
  }));
};

const getArticleById = async (id, versionNumber = null) => {
  const article = await Article.findByPk(id, {
    include: [
      {
        model: Attachment,
        as: 'attachments',
        attributes: ['id', 'filename', 'originalName', 'mimetype', 'size', 'path', 'createdAt'],
        order: [['createdAt', 'ASC']]
      },
      {
        model: Workspace,
        as: 'workspace',
        attributes: ['id', 'name', 'slug', 'color', 'icon']
      },
      {
        model: Comment,
        as: 'comments',
        where: { parentCommentId: null },
        required: false,
        separate: true,
        order: [['createdAt', 'DESC']],
        include: [{
          model: Comment,
          as: 'replies',
          separate: true,
          order: [['createdAt', 'ASC']]
        }]
      }
    ]
  });

  if (!article) {
    throw new Error('Article not found');
  }

  // Получаем нужную версию или текущую
  let version;
  if (versionNumber !== null) {
    version = await ArticleVersion.findOne({
      where: {
        articleId: id,
        versionNumber: versionNumber
      }
    });
    
    if (!version) {
      throw new Error('Version not found');
    }
  } else {
    version = await ArticleVersion.findOne({
      where: {
        articleId: id,
        isCurrent: true
      }
    });
  }

  // Получаем информацию о всех версиях для отображения
  const allVersions = await ArticleVersion.findAll({
    where: { articleId: id },
    attributes: ['id', 'versionNumber', 'isCurrent', 'createdAt'],
    order: [['versionNumber', 'DESC']]
  });

  return {
    id: article.id,
    title: version ? version.title : article.title,
    content: version ? version.content : article.content,
    slug: article.slug,
    workspace: article.workspace ? {
      id: article.workspace.id,
      name: article.workspace.name,
      slug: article.workspace.slug,
      color: article.workspace.color,
      icon: article.workspace.icon
    } : null,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    currentVersion: version ? version.versionNumber : 1,
    isCurrentVersion: version ? version.isCurrent : true,
    totalVersions: allVersions.length,
    versions: allVersions.map(v => ({
      versionNumber: v.versionNumber,
      isCurrent: v.isCurrent,
      createdAt: v.createdAt
    })),
    attachments: article.attachments.map(att => ({
      id: att.id,
      filename: att.filename,
      originalName: att.originalName,
      mimetype: att.mimetype,
      size: att.size,
      uploadedAt: att.createdAt
    })),
    comments: article.comments.map(comment => ({
      id: comment.id,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      content: comment.content,
      isEdited: comment.isEdited,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replies: comment.replies ? comment.replies.map(reply => ({
        id: reply.id,
        authorName: reply.authorName,
        authorEmail: reply.authorEmail,
        content: reply.content,
        isEdited: reply.isEdited,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt
      })) : []
    }))
  };
};

const createArticle = async (title, content, workspaceId = null) => {
  if (workspaceId) {
    const workspace = await Workspace.findByPk(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }
  }

  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  let slug = baseSlug;
  let counter = 1;

  while (await Article.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Используем транзакцию для создания статьи и первой версии
  const result = await db.sequelize.transaction(async (t) => {
    const article = await Article.create({
      title,
      content,
      slug,
      workspaceId
    }, { transaction: t });

    // Создаем первую версию
    await ArticleVersion.create({
      articleId: article.id,
      versionNumber: 1,
      title: article.title,
      content: article.content,
      isCurrent: true
    }, { transaction: t });

    return article;
  });

  return {
    id: result.id,
    title: result.title,
    slug: result.slug,
    workspaceId: result.workspaceId,
    version: 1,
    message: 'Article created successfully'
  };
};

const updateArticle = async (id, title, content, workspaceId) => {
  const article = await Article.findByPk(id);

  if (!article) {
    throw new Error('Article not found');
  }

  if (workspaceId !== undefined && workspaceId !== null) {
    const workspace = await Workspace.findByPk(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }
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

  // Используем транзакцию для создания новой версии
  const result = await db.sequelize.transaction(async (t) => {
    // Обновляем основную статью
    await article.update({
      title,
      content,
      slug,
      workspaceId: workspaceId !== undefined ? workspaceId : article.workspaceId
    }, { transaction: t });

    // Находим текущую максимальную версию
    const maxVersion = await ArticleVersion.max('versionNumber', {
      where: { articleId: id },
      transaction: t
    });

    const newVersionNumber = (maxVersion || 0) + 1;

    // Помечаем все предыдущие версии как не текущие
    await ArticleVersion.update(
      { isCurrent: false },
      { 
        where: { articleId: id },
        transaction: t 
      }
    );

    // Создаем новую версию
    await ArticleVersion.create({
      articleId: id,
      versionNumber: newVersionNumber,
      title,
      content,
      isCurrent: true
    }, { transaction: t });

    return { newVersionNumber };
  });

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    workspaceId: article.workspaceId,
    version: result.newVersionNumber,
    message: 'Article updated successfully (new version created)'
  };
};

const getArticleVersions = async (articleId) => {
  const article = await Article.findByPk(articleId);
  
  if (!article) {
    throw new Error('Article not found');
  }

  const versions = await ArticleVersion.findAll({
    where: { articleId },
    attributes: ['id', 'versionNumber', 'title', 'isCurrent', 'createdAt', 'updatedAt'],
    order: [['versionNumber', 'DESC']]
  });

  return {
    articleId,
    articleTitle: article.title,
    versions: versions.map(v => ({
      versionNumber: v.versionNumber,
      title: v.title,
      isCurrent: v.isCurrent,
      createdAt: v.createdAt
    }))
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

  // Версии удалятся автоматически благодаря CASCADE
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
  getArticleVersions,
  addAttachment,
  deleteAttachment
};
const db = require('../models');
const { Comment, Article } = db;

const getCommentsByArticleId = async (articleId) => {
  const comments = await Comment.findAll({
    where: { articleId, parentCommentId: null }, 
    include: [{
      model: Comment,
      as: 'replies',
      separate: true,
      order: [['createdAt', 'ASC']],
      include: [{
        model: Comment,
        as: 'replies',
        separate: true,
        order: [['createdAt', 'ASC']]
      }]
    }],
    order: [['createdAt', 'DESC']]
  });

  return comments.map(comment => formatComment(comment));
};

const formatComment = (comment) => {
  return {
    id: comment.id,
    articleId: comment.articleId,
    parentCommentId: comment.parentCommentId,
    authorName: comment.authorName,
    authorEmail: comment.authorEmail,
    content: comment.content,
    isEdited: comment.isEdited,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    replies: comment.replies ? comment.replies.map(reply => formatComment(reply)) : []
  };
};

const getCommentById = async (id) => {
  const comment = await Comment.findByPk(id, {
    include: [{
      model: Comment,
      as: 'replies',
      order: [['createdAt', 'ASC']]
    }]
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  return formatComment(comment);
};

const createComment = async (articleId, authorName, content, authorEmail, parentCommentId) => {

  const article = await Article.findByPk(articleId);
  if (!article) {
    throw new Error('Article not found');
  }

  if (parentCommentId) {
    const parentComment = await Comment.findByPk(parentCommentId);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }
    if (parentComment.articleId !== articleId) {
      throw new Error('Parent comment does not belong to this article');
    }
  }

  const comment = await Comment.create({
    articleId,
    parentCommentId: parentCommentId || null,
    authorName,
    authorEmail: authorEmail || null,
    content,
    isEdited: false
  });

  return {
    id: comment.id,
    articleId: comment.articleId,
    parentCommentId: comment.parentCommentId,
    authorName: comment.authorName,
    content: comment.content,
    createdAt: comment.createdAt,
    message: 'Comment created successfully'
  };
};

const updateComment = async (id, content) => {
  const comment = await Comment.findByPk(id);

  if (!comment) {
    throw new Error('Comment not found');
  }

  await comment.update({
    content,
    isEdited: true
  });

  return {
    id: comment.id,
    content: comment.content,
    isEdited: comment.isEdited,
    updatedAt: comment.updatedAt,
    message: 'Comment updated successfully'
  };
};

const deleteComment = async (id) => {
  const comment = await Comment.findByPk(id);

  if (!comment) {
    throw new Error('Comment not found');
  }

  const articleId = comment.articleId;

  await comment.destroy();

  return { articleId };
};

const getCommentCount = async (articleId) => {
  const count = await Comment.count({
    where: { articleId }
  });
  return count;
};

module.exports = {
  getCommentsByArticleId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentCount
};
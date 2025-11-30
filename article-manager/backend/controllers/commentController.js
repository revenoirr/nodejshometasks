const {
  notifyCommentAdded,
  notifyCommentUpdated,
  notifyCommentDeleted
} = require('../websocket/websocketServer');

const getCommentsByArticleId = async (req, res) => {
  try {
    const comments = await commentService.getCommentsByArticleId(req.params.articleId);
    res.json(comments);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to retrieve comments' });
  }
};

const getCommentById = async (req, res) => {
  try {
    const comment = await commentService.getCommentById(req.params.id);
    res.json(comment);
  } catch (err) {
    console.error('Error fetching comment:', err);
    if (err.message === 'Comment not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to retrieve comment' });
  }
};

const createComment = async (req, res) => {
  try {
    const { articleId, authorName, content, authorEmail, parentCommentId } = req.body;
    const result = await commentService.createComment(
      articleId,
      authorName,
      content,
      authorEmail,
      parentCommentId
    );
    res.status(201).json(result);
    const article = await require('../models').Article.findByPk(result.articleId);
    notifyCommentAdded(result, article.title);
    notifyCommentUpdated(result);
  } catch (err) {
    console.error('Error creating comment:', err);
    if (err.message === 'Article not found' || err.message === 'Parent comment not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Parent comment does not belong to this article') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const result = await commentService.updateComment(req.params.id, content);
    res.json(result);
    notifyCommentDeleted(req.params.id);
  } catch (err) {
    console.error('Error updating comment:', err);
    if (err.message === 'Comment not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    await commentService.deleteComment(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    if (err.message === 'Comment not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = {
  getCommentsByArticleId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment
};
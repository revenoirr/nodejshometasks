const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const commentController = require('../controllers/commentController');

// Validation middleware
const validateComment = [
  body('articleId').notEmpty().isUUID(),
  body('authorName').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('content').notEmpty().trim(),
  body('authorEmail').optional().isEmail(),
  body('parentCommentId').optional().isUUID()
];

const validateCommentUpdate = [
  body('content').notEmpty().trim()
];

const validateId = [
  param('id').notEmpty().trim().isUUID()
];

const validateArticleId = [
  param('articleId').notEmpty().trim().isUUID()
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/article/:articleId', validateArticleId, checkValidation, commentController.getCommentsByArticleId);
router.get('/:id', validateId, checkValidation, commentController.getCommentById);
router.post('/', validateComment, checkValidation, commentController.createComment);
router.put('/:id', [...validateId, ...validateCommentUpdate], checkValidation, commentController.updateComment);
router.delete('/:id', validateId, checkValidation, commentController.deleteComment);

module.exports = router;
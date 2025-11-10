const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const articleController = require('../controllers/articleController');

const validateArticle = [
  body('title').notEmpty().trim().isLength({ min: 1, max: 200 }),
  body('content').notEmpty().trim(),
];

const validateId = [
  param('id').notEmpty().trim().escape()
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', articleController.getAllArticles);
router.get('/:id', validateId, checkValidation, articleController.getArticleById);
router.post('/', validateArticle, checkValidation, articleController.createArticle);
router.put('/:id', [...validateId, ...validateArticle], checkValidation, articleController.updateArticle);
router.delete('/:id', validateId, checkValidation, articleController.deleteArticle);

module.exports = router;
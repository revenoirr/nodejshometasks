const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { canEditArticle } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

router.get('/', articleController.getAllArticles);

router.get('/:id', articleController.getArticleById);

router.post('/', articleController.createArticle);

router.put('/:id', canEditArticle, articleController.updateArticle);

router.delete('/:id', canEditArticle, articleController.deleteArticle);

const uploadMiddleware = require('../middleware/uploadMiddleware');
router.post('/:id/attachments', uploadMiddleware.single('file'), articleController.uploadAttachment);

router.delete('/:articleId/attachments/:attachmentId', articleController.deleteAttachment);

module.exports = router;
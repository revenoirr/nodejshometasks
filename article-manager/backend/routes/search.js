const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * GET /search
 * Search articles by title or content
 * Query params:
 *   - q: search query (required, min 2 chars)
 *   - workspaceId: filter by workspace (optional)
 *   - limit: max results (optional, default 50)
 *   - offset: pagination offset (optional, default 0)
 */
router.get('/', searchController.searchArticles);

/**
 * GET /search/suggestions
 * Get search suggestions (autocomplete)
 * Query params:
 *   - q: search query (required, min 2 chars)
 *   - limit: max suggestions (optional, default 5)
 */
router.get('/suggestions', searchController.getSearchSuggestions);

module.exports = router;
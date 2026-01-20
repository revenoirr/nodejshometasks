const searchService = require('../services/searchService');

const searchArticles = async (req, res) => {
  try {
    const { q, workspaceId, limit, offset } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Search query is required',
        message: 'Please provide a search query (q parameter)'
      });
    }

    if (q.trim().length < 2) {
      return res.status(400).json({ 
        error: 'Query too short',
        message: 'Search query must be at least 2 characters'
      });
    }

    const results = await searchService.searchArticles(q.trim(), {
      workspaceId: workspaceId || null,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0,
      userId: req.user?.userId
    });

    res.json(results);
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ 
      error: 'Failed to search articles',
      message: error.message 
    });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const suggestions = await searchService.getSearchSuggestions(
      q.trim(),
      parseInt(limit) || 5
    );

    res.json(suggestions);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      message: error.message 
    });
  }
};

module.exports = {
  searchArticles,
  getSearchSuggestions
};
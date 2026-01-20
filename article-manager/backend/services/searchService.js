const db = require('../models');
const { Article, Workspace, User } = db;
const { Op } = require('sequelize');

/**
 * @param {string} query - Search query
 * @param {object} options - Search options (workspaceId, limit, offset)
 * @returns {Promise<{articles: Array, total: number}>}
 */
const searchArticles = async (query, options = {}) => {
  try {
    const {
      workspaceId = null,
      limit = 50,
      offset = 0,
      userId = null
    } = options;

    const whereClause = {
      [Op.or]: [
        {
          title: {
            [Op.iLike]: `%${query}%`
          }
        },
        {
          content: {
            [Op.iLike]: `%${query}%`
          }
        }
      ]
    };

    if (workspaceId) {
      whereClause.workspaceId = workspaceId;
    }

    const { count, rows } = await Article.findAndCountAll({
      where: whereClause,
      attributes: [
        'id',
        'title',
        'content',
        'slug',
        // 'workspaceId',
        // 'createdBy',
        // 'currentVersion',
        'createdAt',
        'updatedAt'
      ],
      include: [
        {
          model: Workspace,
          as: 'workspace',
          attributes: ['id', 'name', 'icon', 'color'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['updatedAt', 'DESC']],
      distinct: true
    });

    const articles = rows.map(article => {
      const articleData = article.toJSON();

      articleData.searchMatch = {
        title: article.title.toLowerCase().includes(query.toLowerCase()),
        content: article.content.toLowerCase().includes(query.toLowerCase())
      };

      return articleData;
    });

    return {
      articles,
      total: count,
      query,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

/**
 * @param {string} query - Search query
 * @param {number} limit - Max number of suggestions
 * @returns {Promise<Array>}
 */
const getSearchSuggestions = async (query, limit = 5) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const articles = await Article.findAll({
      where: {
        title: {
          [Op.iLike]: `%${query}%`
        }
      },
      attributes: ['id', 'title', 'slug'],
      limit,
      order: [['updatedAt', 'DESC']]
    });

    return articles.map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug
    }));
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    throw error;
  }
};

module.exports = {
  searchArticles,
  getSearchSuggestions
};
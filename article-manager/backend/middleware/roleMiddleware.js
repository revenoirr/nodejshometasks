const db = require('../models');
const { User } = db;

const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const user = await User.findByPk(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Admin privileges required' 
      });
    }

    req.currentUser = user;
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      error: 'Failed to verify admin status' 
    });
  }
};


const canEditArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }

    const user = await User.findByPk(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    const { Article } = db;
    const article = await Article.findByPk(id);
    
    if (!article) {
      return res.status(404).json({ 
        error: 'Article not found' 
      });
    }

    const isCreator = article.created_by === user.id;
    const isAdmin = user.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Only the article creator or an admin can edit this article' 
      });
    }

    req.currentUser = user;
    req.article = article;
    
    next();
  } catch (error) {
    console.error('Article permission middleware error:', error);
    res.status(500).json({ 
      error: 'Failed to verify permissions' 
    });
  }
};

module.exports = {
  requireAdmin,
  canEditArticle
};
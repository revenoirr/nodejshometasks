const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    define: dbConfig.define,
    dialectOptions: dbConfig.dialectOptions || {},
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Workspace = require('./workspace')(sequelize, Sequelize);
db.Article = require('./article')(sequelize, Sequelize);
db.Attachment = require('./attachment')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);

db.Workspace.hasMany(db.Article, {
  foreignKey: 'workspaceId',
  as: 'articles',
  onDelete: 'SET NULL'
});

db.Article.belongsTo(db.Workspace, {
  foreignKey: 'workspaceId',
  as: 'workspace'
});

db.Article.hasMany(db.Attachment, {
  foreignKey: 'articleId',
  as: 'attachments',
  onDelete: 'CASCADE'
});

db.Attachment.belongsTo(db.Article, {
  foreignKey: 'articleId',
  as: 'article'
});

db.Article.hasMany(db.Comment, {
  foreignKey: 'articleId',
  as: 'comments',
  onDelete: 'CASCADE'
});

db.Comment.belongsTo(db.Article, {
  foreignKey: 'articleId',
  as: 'article'
});

db.Comment.hasMany(db.Comment, {
  as: 'replies',
  foreignKey: 'parentCommentId',
  onDelete: 'CASCADE'
});

db.Comment.belongsTo(db.Comment, {
  as: 'parentComment',
  foreignKey: 'parentCommentId'
});

module.exports = db;
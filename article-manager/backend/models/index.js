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

db.Article = require('./article')(sequelize, Sequelize);
db.Attachment = require('./attachment')(sequelize, Sequelize);

db.Article.hasMany(db.Attachment, {
  foreignKey: 'articleId',
  as: 'attachments',
  onDelete: 'CASCADE'
});

db.Attachment.belongsTo(db.Article, {
  foreignKey: 'articleId',
  as: 'article'
});

module.exports = db;
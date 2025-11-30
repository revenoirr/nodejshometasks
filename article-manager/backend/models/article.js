module.exports = (sequelize, DataTypes) => {
  const Article = sequelize.define('Article', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    workspaceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'workspace_id'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 200]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    slug: {
      type: DataTypes.STRING(250),
      unique: true,
      allowNull: false
    }
  }, {
    tableName: 'articles',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['workspace_id']
      }
    ]
  });

  Article.prototype.generateSlug = function() {
    return this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  Article.beforeValidate((article) => {
    if (article.title && !article.slug) {
      article.slug = article.generateSlug();
    }
  });

  return Article;
};
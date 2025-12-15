module.exports = (sequelize, DataTypes) => {
  const ArticleVersion = sequelize.define('ArticleVersion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'article_id'
    },
    versionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'version_number'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_current'
    }
  }, {
    tableName: 'article_versions',
    timestamps: true,
    underscored: true,  // <-- ДОБАВЬ ЭТУ СТРОКУ!
    indexes: [
      {
        fields: ['article_id']
      },
      {
        unique: true,
        fields: ['article_id', 'version_number']
      },
      {
        fields: ['article_id', 'is_current']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return ArticleVersion;
};
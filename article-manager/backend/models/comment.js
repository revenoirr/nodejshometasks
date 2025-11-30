module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
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
    parentCommentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'parent_comment_id'
    },
    authorName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'author_name',
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    authorEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'author_email',
      validate: {
        isEmail: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_edited'
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['article_id']
      },
      {
        fields: ['parent_comment_id']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Comment;
};
module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    filename: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'File name stored on server'
    },
    originalName: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Original file name uploaded by user'
    },
    mimetype: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'File size in bytes'
    },
    path: {
      type: DataTypes.STRING(1000),
      allowNull: false,
      comment: 'Relative path to file'
    }
  }, {
    tableName: 'attachments',
    timestamps: true,
    indexes: [
      {
        fields: ['articleId']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Attachment;
};
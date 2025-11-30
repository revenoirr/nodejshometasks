module.exports = (sequelize, DataTypes) => {
  const Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    slug: {
      type: DataTypes.STRING(120),
      unique: true,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '#667eea'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '📁'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'workspaces',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['slug']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  Workspace.prototype.generateSlug = function() {
    return this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  Workspace.beforeValidate((workspace) => {
    if (workspace.name && !workspace.slug) {
      workspace.slug = workspace.generateSlug();
    }
  });

  return Workspace;
};
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('article_versions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'articles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'article_id'
      },
      versionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'version_number'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isCurrent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_current'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      }
    });

    await queryInterface.addIndex('article_versions', ['article_id'], {
      name: 'article_versions_article_id_idx'
    });

    await queryInterface.addIndex('article_versions', ['article_id', 'version_number'], {
      name: 'article_versions_article_version_idx',
      unique: true
    });

    await queryInterface.addIndex('article_versions', ['article_id', 'is_current'], {
      name: 'article_versions_article_current_idx'
    });

    await queryInterface.addIndex('article_versions', ['created_at'], {
      name: 'article_versions_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('article_versions');
  }
};
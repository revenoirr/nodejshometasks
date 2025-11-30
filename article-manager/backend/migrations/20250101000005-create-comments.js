'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comments', {
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
      parentCommentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'comments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        field: 'parent_comment_id'
      },
      authorName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'author_name'
      },
      authorEmail: {
        type: Sequelize.STRING(255),
        allowNull: true,
        field: 'author_email'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_edited'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('comments', ['article_id'], {
      name: 'comments_article_id_idx'
    });

    await queryInterface.addIndex('comments', ['parent_comment_id'], {
      name: 'comments_parent_comment_id_idx'
    });

    await queryInterface.addIndex('comments', ['createdAt'], {
      name: 'comments_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('comments');
  }
};
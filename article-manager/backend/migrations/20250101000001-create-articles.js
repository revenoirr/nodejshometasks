'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('articles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(250),
        allowNull: false,
        unique: true
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

    await queryInterface.addIndex('articles', ['slug'], {
      unique: true,
      name: 'articles_slug_unique'
    });

    await queryInterface.addIndex('articles', ['createdAt'], {
      name: 'articles_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('articles');
  }
};
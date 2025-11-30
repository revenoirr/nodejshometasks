'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('articles', 'workspace_id', {
      type: Sequelize.UUID,
      allowNull: true, 
      references: {
        model: 'workspaces',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('articles', ['workspace_id'], {
      name: 'articles_workspace_id_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('articles', 'articles_workspace_id_idx');
    await queryInterface.removeColumn('articles', 'workspace_id');
  }
};
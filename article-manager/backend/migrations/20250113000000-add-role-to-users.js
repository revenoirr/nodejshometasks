'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user',
      after: 'email'
    });

    await queryInterface.addIndex('users', ['role'], {
      name: 'users_role_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'users_role_index');
    await queryInterface.removeColumn('users', 'role');
    
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  }
};
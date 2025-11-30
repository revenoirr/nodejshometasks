'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    const workspaces = [
      {
        id: uuidv4(),
        name: 'Personal',
        description: 'Personal articles and notes',
        slug: 'personal',
        color: '#667eea',
        icon: '👤',
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Work',
        description: 'Work-related documentation and guides',
        slug: 'work',
        color: '#f59e0b',
        icon: '💼',
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Learning',
        description: 'Learning materials and tutorials',
        slug: 'learning',
        color: '#10b981',
        icon: '📚',
        is_active: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        name: 'Projects',
        description: 'Project documentation and plans',
        slug: 'projects',
        color: '#ef4444',
        icon: '🚀',
        is_active: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('workspaces', workspaces, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('workspaces', null, {});
  }
};
'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    const articles = [
      {
        id: uuidv4(),
        title: 'Getting Started with PostgreSQL',
        content: '<h2>Introduction to PostgreSQL</h2><p>PostgreSQL is a powerful, open-source object-relational database system. It has earned a strong reputation for reliability, feature robustness, and performance.</p><p>In this article, we will explore the basics of PostgreSQL and why it is an excellent choice for modern applications.</p>',
        slug: 'getting-started-with-postgresql',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        title: 'Building REST APIs with Node.js and Express',
        content: '<h2>Modern API Development</h2><p>Node.js combined with Express provides a powerful platform for building scalable REST APIs. This guide will walk you through best practices for API design and implementation.</p><ul><li>RESTful routing</li><li>Middleware patterns</li><li>Error handling</li><li>Authentication</li></ul>',
        slug: 'building-rest-apis-with-nodejs-and-express',
        createdAt: now,
        updatedAt: now
      },
      {
        id: uuidv4(),
        title: 'Sequelize ORM: A Complete Guide',
        content: '<h2>What is Sequelize?</h2><p>Sequelize is a promise-based Node.js ORM for Postgres, MySQL, MariaDB, SQLite, and Microsoft SQL Server. It features solid transaction support, relations, eager and lazy loading, read replication and more.</p><p><strong>Key Features:</strong></p><ul><li>Model definitions</li><li>Associations</li><li>Migrations</li><li>Validation</li><li>Hooks</li></ul>',
        slug: 'sequelize-orm-a-complete-guide',
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert('articles', articles, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('articles', null, {});
  }
};
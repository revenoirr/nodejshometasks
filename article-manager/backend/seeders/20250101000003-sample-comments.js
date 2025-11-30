'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const articles = await queryInterface.sequelize.query(
      'SELECT id FROM articles LIMIT 3;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (articles.length === 0) {
      console.log('No articles found. Skipping comment seeding.');
      return;
    }

    const now = new Date();
    const comments = [];

    articles.forEach((article, index) => {
      const commentId1 = uuidv4();
      const commentId2 = uuidv4();
      const commentId3 = uuidv4();

      comments.push({
        id: commentId1,
        article_id: article.id,
        parent_comment_id: null,
        author_name: 'Alice Johnson',
        author_email: 'alice@example.com',
        content: 'Great article! Very informative and well-written.',
        is_edited: false,
        createdAt: new Date(now.getTime() - 3600000 * (index + 1)),
        updatedAt: new Date(now.getTime() - 3600000 * (index + 1))
      });

      comments.push({
        id: commentId2,
        article_id: article.id,
        parent_comment_id: null,
        author_name: 'Bob Smith',
        author_email: 'bob@example.com',
        content: 'Thanks for sharing this. I learned a lot from reading it.',
        is_edited: false,
        createdAt: new Date(now.getTime() - 7200000 * (index + 1)),
        updatedAt: new Date(now.getTime() - 7200000 * (index + 1))
      });

      comments.push({
        id: commentId3,
        article_id: article.id,
        parent_comment_id: null,
        author_name: 'Carol Davis',
        author_email: 'carol@example.com',
        content: 'Could you provide more details on this topic?',
        is_edited: false,
        createdAt: new Date(now.getTime() - 10800000 * (index + 1)),
        updatedAt: new Date(now.getTime() - 10800000 * (index + 1))
      });

      comments.push({
        id: uuidv4(),
        article_id: article.id,
        parent_comment_id: commentId1,
        author_name: 'David Wilson',
        author_email: 'david@example.com',
        content: 'I agree! This is one of the best explanations I\'ve seen.',
        is_edited: false,
        createdAt: new Date(now.getTime() - 1800000 * (index + 1)),
        updatedAt: new Date(now.getTime() - 1800000 * (index + 1))
      });

      comments.push({
        id: uuidv4(),
        article_id: article.id,
        parent_comment_id: commentId3,
        author_name: 'Emma Brown',
        author_email: 'emma@example.com',
        content: 'Sure! Check out the references section at the bottom.',
        is_edited: false,
        createdAt: new Date(now.getTime() - 900000 * (index + 1)),
        updatedAt: new Date(now.getTime() - 900000 * (index + 1))
      });
    });

    await queryInterface.bulkInsert('comments', comments, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('comments', null, {});
  }
};
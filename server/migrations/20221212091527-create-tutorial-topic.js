'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TutorialTopics', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      topicName: {
        type: Sequelize.STRING
      },
      topicOrder: {
        type: Sequelize.INTEGER
      },
      subTopicName: {
        type: Sequelize.STRING
      },
      subTopicOrder: {
        type: Sequelize.INTEGER
      },
      pageHeader: {
        type: Sequelize.STRING
      },
      textContent: {
        type: Sequelize.STRING(9999)
      },
      videoLink: {
        type: Sequelize.STRING(9999)
      },
      images: {
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('TutorialTopics');
  }
};
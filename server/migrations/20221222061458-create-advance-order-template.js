'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AdvanceOrderTemplates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      farmId:{
        type:Sequelize.INTEGER,
      },
      farmName: {
        type: Sequelize.STRING
      },
      orderId:{
        type:Sequelize.INTEGER
      },
      orderName: {
        type: Sequelize.STRING
      },
      shareHolderData:{
        type: Sequelize.JSON,
        defaultValue: []
      },
      customerId:{
        type:Sequelize.INTEGER
      },
      organizationId:{
        type:Sequelize.INTEGER
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
    return queryInterface.dropTable('AdvanceOrderTemplates');
  }
};
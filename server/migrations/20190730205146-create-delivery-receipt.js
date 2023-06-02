'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DeliveryReceipts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      PurchaseOrderId: {
        type: Sequelize.INTEGER
      },
      deliveredBy:{
        type: Sequelize.STRING,
        defaultValue: ""
      },
      deliveredAt:{
        type: Sequelize.DATE,
        defaultValue: new Date()
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
    return queryInterface.dropTable('DeliveryReceipts');
  }
};
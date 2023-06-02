'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      seedType: {
        type: Sequelize.STRING
      },
      brand: {
        type: Sequelize.STRING
      },
      blend: {
        type: Sequelize.STRING
      },
      seedSize: {
        type: Sequelize.STRING
      },
      treatment: {
        type: Sequelize.STRING
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      msrp: {
        type: Sequelize.DECIMAL
      },
      amountPerBag: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Products');
  }
};
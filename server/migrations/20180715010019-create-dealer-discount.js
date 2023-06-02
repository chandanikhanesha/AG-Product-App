'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DealerDiscounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productCategory: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      lastDate: {
        type: Sequelize.DATE
      },
      discountStrategy: {
        type: Sequelize.STRING
      },
      detail: {
        type: Sequelize.JSONB
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
    return queryInterface.dropTable('DealerDiscounts');
  }
};
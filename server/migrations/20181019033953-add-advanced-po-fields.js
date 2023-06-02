'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn('CustomerProducts', 'FarmId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Farms',
        key: 'id'
      }
    })
    .then(() => queryInterface.addColumn('CustomerProducts', 'fieldName', Sequelize.STRING))
    .then(() => queryInterface.addColumn('CustomerProducts', 'shareholderData', {
      type: Sequelize.JSON,
      defaultValue: []
    }))
    .then(() => queryInterface.addColumn('PurchaseOrders', 'shareholderData', {
      type: Sequelize.JSON,
      defaultValue: []
    }))

    .then(() => queryInterface.addColumn('CustomerCustomProducts', 'FarmId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Farms',
        key: 'id'
      }
    }))
    .then(() => queryInterface.addColumn('CustomerCustomProducts', 'fieldName', Sequelize.STRING))
    .then(() => queryInterface.addColumn('CustomerCustomProducts', 'shareholderData', {
      type: Sequelize.JSON,
      defaultValue: []
    }))
    .then(() => queryInterface.addColumn('PurchaseOrders', 'farmData', {
      type: Sequelize.JSON,
      defaultValue: []
    }))
    .then(() => queryInterface.addColumn('Quotes', 'farmData', {
      type: Sequelize.JSON,
      defaultValue: []
    }))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};

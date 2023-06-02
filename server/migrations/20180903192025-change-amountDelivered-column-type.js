'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   return queryInterface.removeColumn(
     'CustomerProducts',
     'amountDelivered'
   ).then(() => queryInterface.removeColumn(
     'CustomerCustomProducts',
     'amountDelivered'
   )).then(() => queryInterface.addColumn(
    'CustomerProducts',
    'amountDelivered',
    Sequelize.INTEGER
  )).then(() => queryInterface.addColumn(
     'CustomerCustomProducts',
     'amountDelivered',
     Sequelize.INTEGER
   ))
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

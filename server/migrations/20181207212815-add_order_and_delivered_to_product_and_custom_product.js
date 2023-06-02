'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn('Products','orderAmount', Sequelize.INTEGER).then(() => queryInterface.addColumn('Products', 'deliveredAmount', Sequelize.INTEGER))
    .then(() => queryInterface.addColumn('CustomProducts', 'orderAmount', Sequelize.INTEGER))
    .then(() => queryInterface.addColumn('CustomProducts', 'deliveredAmount', Sequelize.INTEGER))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
   return queryInterface.removeColumn(
     'Products',
     'orderAmount'
   )
   .then(() => queryInterface.removeColumn(
     'Products',
     'deliveredAmount'
   ))
   .then(() => queryInterface.removeColumn(
     'CustomProducts',
     'orderAmount'
   ))
   .then(() => queryInterface.removeColumn(
     'CustomProducts',
     'deliveredAmount'
   ))
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

   await queryInterface.removeColumn(
    'CustomLots',
    'dealerId'
  );
  await queryInterface.removeColumn(
    'CustomLots',
    'dealerName'
  );
  await queryInterface.removeColumn(
    'CustomLots',
    'dealerAddress'
  );
   await queryInterface.addColumn('CustomLots',
    'dealerId',
    {
      type: Sequelize.INTEGER,
    });
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

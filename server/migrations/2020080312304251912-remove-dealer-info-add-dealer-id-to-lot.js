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
    'Lots',
    'dealerId'
  );
  await queryInterface.removeColumn(
    'Lots',
    'dealerName'
  );
  await queryInterface.removeColumn(
    'Lots',
    'dealerAddress'
  );
   await queryInterface.addColumn('Lots',
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

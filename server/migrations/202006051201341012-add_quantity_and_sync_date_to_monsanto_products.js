'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   await queryInterface.addColumn(
     'MonsantoProducts',
     'quantity',
     Sequelize.STRING
   );
   await queryInterface.addColumn(
     'MonsantoProducts',
     'syncQuantityDate',
     Sequelize.DATE
   );
  },

  down:async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.removeColumn("MonsantoProducts", "quantity");
    await queryInterface.removeColumn("MonsantoProducts", "syncQuantityDate");
  }
};

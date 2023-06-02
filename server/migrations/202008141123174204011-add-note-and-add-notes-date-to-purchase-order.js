'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   await queryInterface.addColumn('PurchaseOrders',
    'notes',
    {
      type: Sequelize.TEXT,
    });
    await queryInterface.addColumn('PurchaseOrders',
     'addNotesDate',
     {
       type: Sequelize.DATE,
     });
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.removeColumn("PurchaseOrders", "notes");
    await queryInterface.removeColumn("PurchaseOrders", "addNotesDate");
  }
};

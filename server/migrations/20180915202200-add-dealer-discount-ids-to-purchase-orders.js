'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   return queryInterface.addColumn(
    'PurchaseOrders',
    'DealerDiscounts',
    {
      type: Sequelize.JSON
    }
   )
   .then(() => {
     queryInterface.addColumn(
      'Quotes',
      'DealerDiscountIds',
      {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }
     )
   })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.removeColumn(
      'Quotes',
      'DealerDiscountIds'
    )
    .then(() => {
      queryInterface.removeColumn(
        'PurchaseOrders',
        'DealerDiscounts'
      )
    })
  }
};

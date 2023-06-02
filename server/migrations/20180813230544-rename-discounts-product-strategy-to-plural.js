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
      'DealerDiscounts',
      'productCategories',
      {
        type: Sequelize.ARRAY(Sequelize.STRING)
      }
    )
    .then(() => queryInterface.removeColumn(
      'DealerDiscounts',
      'productCategory',
    ))
    .then(() => queryInterface.addColumn(
      'DealerDiscounts',
      'companyIds',
      {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }
    ))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
   return queryInterface.removeColumn(
    'DealerDiscounts',
    'companyIds'
   )
   .then(() => queryInterface.addColumn(
    'DealerDiscounts',
    'productCategory',
    {
      type: Sequelize.STRING
    }
   ))
   .then(() => queryInterface.removeColumn(
    'DealerDiscounts',
    'productCategories',
   ))
  }
};

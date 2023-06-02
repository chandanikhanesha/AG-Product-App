'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Products',
      'PackagingId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Packagings',
          key: 'id'
        }
      }
    )
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
     'PackagingId'
   )
  }
};

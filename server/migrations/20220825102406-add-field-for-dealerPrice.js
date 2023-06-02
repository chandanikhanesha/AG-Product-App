'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Products','dealerPrice', Sequelize.FLOAT)
    .then(() => queryInterface.addColumn('CustomProducts', 'dealerPrice', Sequelize.FLOAT))
   
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Products',
      'dealerPrice'
    )
    .then(() => queryInterface.removeColumn(
      'CustomProducts',
      'dealerPrice'
    ))
  }
};

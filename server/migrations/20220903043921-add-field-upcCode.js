'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('MonsantoProductLineItems','upcCode', Sequelize.STRING)
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'MonsantoProductLineItems',
      'upcCode'
    )
  }
};

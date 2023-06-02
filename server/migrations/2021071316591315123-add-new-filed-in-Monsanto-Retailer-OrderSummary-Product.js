'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('MonsantoRetailerOrderSummaryProducts',
      'supply',
      {
        type: Sequelize.INTEGER,
      });
  },

  down: (queryInterface, Sequelize) => {
  }
};

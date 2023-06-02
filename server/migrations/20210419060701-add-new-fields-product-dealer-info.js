'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ProductDealers',
      'notes',
      {
        type: Sequelize.STRING,
      });
    await queryInterface.addColumn('ProductDealers',
      'phone',
      {
        type: Sequelize.STRING,
      });
    await queryInterface.addColumn('ProductDealers',
      'email',
      {
        type: Sequelize.STRING,
      });
    await queryInterface.addColumn('ProductDealers',
      'address',
      {
        type: Sequelize.STRING,
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('ProductDealers',
      'notes'
    )
    await queryInterface.removeColumn('ProductDealers',
      'phone'
    )
    await queryInterface.removeColumn('ProductDealers',
      'email'
    )
    await queryInterface.removeColumn('ProductDealers',
      'address'
    )
  }
};

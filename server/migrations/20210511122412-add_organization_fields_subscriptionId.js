'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Organizations',
      'subscriptionID',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Subscriptions',
          key: 'id'
        }
      });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Organizations',
      'subscriptionID'
    )
  }
};

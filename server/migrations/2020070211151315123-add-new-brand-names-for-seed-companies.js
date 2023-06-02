'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SeedCompanies',
    'canolaBrandName',
    {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('SeedCompanies',
    'alfalfaBrandName',
    {
      type: Sequelize.STRING,
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("CustomerMonsantoProducts", "isDeteleSynced");
  }
};

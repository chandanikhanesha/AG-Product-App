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
      'SeedSizes',
      'SeedCompanyId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'SeedCompanies',
          key: 'id'
        }
      }
    ).then(() => queryInterface.addColumn(
      'SeedSizes',
      'seedType',
      Sequelize.STRING
    )).then(() => queryInterface.addColumn(
      'Packagings',
      'SeedCompanyId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'SeedCompanies',
          key: 'id'
        }
      }
    ).then(() => queryInterface.addColumn(
      'Packagings',
      'seedType',
      Sequelize.STRING
    )))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};

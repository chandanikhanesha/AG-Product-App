'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    await queryInterface.addColumn(
      'Seasons',
      'seedCompanyIds',
      {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      }
    );
    await queryInterface.addColumn(
        'Seasons',
        'companyIds',
        {
          type: Sequelize.ARRAY(Sequelize.INTEGER)
        }
      );
      await queryInterface.addColumn(
          'Seasons',
          'apiCompanyIds',
          {
            type: Sequelize.ARRAY(Sequelize.INTEGER)
          }
        );
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.removeColumn(
      'Seasons',
      'seedCompanyIds'
    )
    await queryInterface.removeColumn("Seasons", "companyIds");
    await queryInterface.removeColumn("Seasons", "apiCompanyIds");
  }
};

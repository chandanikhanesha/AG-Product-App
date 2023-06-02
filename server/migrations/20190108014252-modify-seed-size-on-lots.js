'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.removeColumn(
      'Lots',
      'seedSize'
    )
      .then(() => queryInterface.addColumn(
        'Lots',
        'SeedSizeId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'SeedSizes',
            key: 'id'
          }
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
  }
};

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
      'Lots',
      'seedSize',
      Sequelize.STRING
    ).then(() => queryInterface.addColumn(
      'Lots',
      'PackagingId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Packagings',
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
    return queryInterface.removeColumn(
      'Lots',
      'PackagingId'
    ).then(() => queryInterface.removeColumn(
      'Lots',
      'seedSize'
    ))
  }
};

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
      'CustomerProducts',
      'seedSize',
      Sequelize.STRING
    ).then(() => queryInterface.addColumn(
      'CustomerProducts',
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
      'CustomerProducts',
      'PackagingId'
    ).then(() => queryInterface.removeColumn(
      'CustomerProducts',
      'seedSize'
    ))
  }
};

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.renameColumn(
      'Customers',
      'businessAddress',
      'businessStreet'
    )
      .then(() => queryInterface.addColumn(
        'Customers',
        'businessCity',
        Sequelize.STRING
      ))
      .then(() => queryInterface.addColumn(
        'Customers',
        'businessState',
        Sequelize.STRING
      ))
      .then(() => queryInterface.addColumn(
        'Customers',
        'businessZip',
        Sequelize.STRING
      ))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.renameColumn(
      'Customers',
      'businessStreet',
      'businessAddress'
    ).then(() => queryInterface.removeColumn(
      'Customers',
      'businessCity'
    )).then(() => queryInterface.removeColumn(
      'Customers',
      'businessState'
    )).then(() => queryInterface.removeColumn(
      'Customers',
      'businessZip'
    ))
  }
};

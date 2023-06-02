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
      'phoneNumber',
      'officePhoneNumber'
    )
      .then(() => queryInterface.addColumn(
        'Customers',
        'cellPhoneNumber',
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
      'officePhoneNumber',
      'phoneNumber'
    ).then(() => queryInterface.removeColumn(
      'Customers',
      'cellPhoneNumber'
    ))
  }
};

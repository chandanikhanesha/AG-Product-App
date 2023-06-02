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
      'orderAmount',
      {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    )
      .then(() => queryInterface.addColumn(
        'Lots',
        'delivered',
        {
          type: Sequelize.INTEGER,
          defaultValue: 0
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
      'delivered'
    )
      .then(() => queryInterface.removeColumn(
        'Lots',
        'orderAmount'
      ))
  }
};

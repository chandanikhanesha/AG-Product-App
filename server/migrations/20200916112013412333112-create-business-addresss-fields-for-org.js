"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface
      .addColumn("Organizations", "officePhoneNumber", Sequelize.STRING)
      .then(() =>
        queryInterface.addColumn(
          "Organizations",
          "businessStreet",
          Sequelize.STRING
        )
      )
      .then(() =>
        queryInterface.addColumn(
          "Organizations",
          "businessCity",
          Sequelize.STRING
        )
      )
      .then(() =>
        queryInterface.addColumn(
          "Organizations",
          "businessState",
          Sequelize.STRING
        )
      )
      .then(() =>
        queryInterface.addColumn(
          "Organizations",
          "businessZip",
          Sequelize.STRING
        )
      );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface
      .removeColumn("Organizations", "officePhoneNumber")
      .then(() => queryInterface.removeColumn("Organizations", "businessStreet"))
      .then(() => queryInterface.removeColumn("Organizations", "businessCity"))
      .then(() => queryInterface.removeColumn("Organizations", "businessState"))
      .then(() => queryInterface.removeColumn("Organizations", "businessZip"));
  },
};

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
      .addColumn("Shareholders", "deliveryAddress", Sequelize.STRING)
      .then(() => queryInterface.addColumn("Shareholders", "businessStreet", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Shareholders", "businessCity", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Shareholders", "businessState", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Shareholders", "businessZip", Sequelize.STRING))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface
      .removeColumn("Shareholders", "deliveryAddress")
      .then(() => queryInterface.removeColumn("Shareholders", "businessStreet"))
      .then(() => queryInterface.removeColumn("Shareholders", "businessCity"))
      .then(() => queryInterface.removeColumn("Shareholders", "businessState"))
      .then(() => queryInterface.removeColumn("Shareholders", "businessZip"))
  },
};

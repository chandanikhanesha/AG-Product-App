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
      .addColumn("Lots", "orderDate", Sequelize.DATE)
      .then(() =>
        queryInterface.addColumn(
          "Lots",
          "source",
          Sequelize.ENUM(
            "Seed Company",
            "Seed Dealer Transfer In",
            "Seed Dealer Transfer Out"
          )
        )
      )
      .then(() =>
        queryInterface.addColumn("Lots", "dealerId", Sequelize.STRING)
      )
      .then(() =>
        queryInterface.addColumn("Lots", "dealerName", Sequelize.STRING)
      )
      .then(() =>
        queryInterface.addColumn("Lots", "dealerAddress", Sequelize.STRING)
      );
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

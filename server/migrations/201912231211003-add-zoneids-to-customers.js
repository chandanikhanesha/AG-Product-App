"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Customers",
      "zoneIds",
      {
        type: Sequelize.JSON
      }
    );
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("Customers", "zoneIds");
  }
};


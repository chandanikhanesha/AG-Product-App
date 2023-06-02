"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "Customers",
      "glnId",
      {
        type: Sequelize.STRING
      }
    );
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("Customers", "glnId");
  }
};


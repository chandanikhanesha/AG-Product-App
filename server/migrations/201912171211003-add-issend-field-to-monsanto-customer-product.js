"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("CustomerMonsantoProducts", "isSent", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
    
    await queryInterface.addColumn("CustomerMonsantoProducts", "lineNumber", {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn(
      "CustomerMonsantoProducts",
      "lineItemNumber",
      {
        type: Sequelize.STRING
      }
    );
    await queryInterface.addColumn(
      "CustomerMonsantoProducts",
      "monsantoOrderQty",
      {
        type: Sequelize.FLOAT
      }
    );

    await queryInterface.addColumn("CustomerMonsantoProducts", "unit", {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn("CustomerMonsantoProducts", "price", {
      type: Sequelize.STRING
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("CustomerMonsantoProducts", "isSent");
    await queryInterface.removeColumn("CustomerMonsantoProducts", "lineNumber");
    await queryInterface.removeColumn(
      "CustomerMonsantoProducts",
      "lineItemNumber"
    );
    await queryInterface.removeColumn(
      "CustomerMonsantoProducts",
      "monsantoOrderQty"
    );

    await queryInterface.removeColumn("CustomerMonsantoProducts", "unit");
  }
};

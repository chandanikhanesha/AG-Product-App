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
      .addColumn("PurchaseOrderStatements", "statementData", {
        type: Sequelize.ARRAY(Sequelize.JSON)
      })
      .then(() =>
        queryInterface.addColumn("PurchaseOrderStatements", "totalAmount", {
          type: Sequelize.FLOAT
        })
      ).then(() =>
      queryInterface.addColumn("PurchaseOrderStatements", "reportUpdatedDate", {
        type: Sequelize.DATE
      })
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
      .removeColumn("PurchaseOrderStatements", "statementData")
      .then(() =>
        queryInterface.removeColumn("PurchaseOrderStatements", "totalAmount")
      ).then(() =>
      queryInterface.removeColumn("PurchaseOrderStatements", "reportUpdatedDate")
    );
  }
};

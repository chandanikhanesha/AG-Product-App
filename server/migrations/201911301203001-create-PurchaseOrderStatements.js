"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("PurchaseOrderStatements", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Organizations",
          key: "id"
        }
      },
      StatementId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Statements",
          key: "id"
        }
      },
      statementNo: {
        allowNull: false,
        type: Sequelize.STRING
      },
      PurchaseOrderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "PurchaseOrders",
          key: "id"
        }
      },
      isRemoved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isDeferred: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deferredDate: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("PurchaseOrderStatement");
  }
};

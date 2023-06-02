"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("CustomEarlyPays", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
      },
      CustomerId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Customers",
          key: "id",
        },
      },
      PurchaseOrderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "PurchaseOrders",
          key: "id",
        },
      },
      payByDate: { allowNull: false, type: Sequelize.DATE },
      payingLessAmount:{ allowNull: false, type: Sequelize.INTEGER },
      remainingTotal:{ allowNull: false, type: Sequelize.INTEGER },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("CustomEarlyPays");
  },
};

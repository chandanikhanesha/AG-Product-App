"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Notes", {
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
      note: { type: Sequelize.TEXT },
      relatedType: { type: Sequelize.STRING },
      CustomerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Customers",
          key: "id",
        },
      },
      PurchaseOrderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "PurchaseOrders",
          key: "id",
        },
      },
      reminderDate: { type: Sequelize.DATE },
      isDeleted: { type: Sequelize.BOOLEAN, defaultValue: false },
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
    return queryInterface.dropTable("Notes");
  },
};

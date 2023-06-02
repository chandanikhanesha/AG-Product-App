"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("CustomLots", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quantity: {
        type: Sequelize.DECIMAL,
      },
      LotNumber: {
        type: Sequelize.STRING,
      },
      customProductId: {
        type: Sequelize.INTEGER,
        references: {
          model: "CustomProducts",
          key: "id",
        },
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
      },
      PackagingId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Packagings",
          key: "id",
        },
      },
      SeedSizeId: {
        type: Sequelize.INTEGER,
        references: {
          model: "SeedSizes",
          key: "id",
        },
      },
      duplicate: { type: Sequelize.INTEGER },
      orderAmount: { type: Sequelize.INTEGER },
      delivered: { type: Sequelize.INTEGER },
      transfer: { type: Sequelize.ENUM("in", "out") },
      transferInfo: { type: Sequelize.JSON },
      orderDate: { type: Sequelize.DATE },
      source: { type: Sequelize.STRING },
      dealerId: { type: Sequelize.STRING },
      dealerName: { type: Sequelize.STRING },
      dealerAddress: { type: Sequelize.STRING },
      isReturn: {type:Sequelize.BOOLEAN},
      isDeleted: { type: Sequelize.BOOLEAN },
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
    return queryInterface.dropTable("CustomLots");
  },
};

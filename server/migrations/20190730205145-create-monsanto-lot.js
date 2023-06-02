"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("MonsantoLots", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quantity: {
        type: Sequelize.DECIMAL,
      },
      receivedQty: {
        type: Sequelize.DECIMAL
      },
      LotNumber: {
        type: Sequelize.STRING,
      },
      lineNumber: {
        type: Sequelize.STRING
      },
      MonsantoProductId: {
        type: Sequelize.INTEGER,
        references: {
          model: "MonsantoProducts",
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
      isDeleted: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isNew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      crossReferenceId: { type: Sequelize.STRING },
      grossVolume: { type: Sequelize.STRING },
      netWeight: { type: Sequelize.STRING },
      shipDate: { type: Sequelize.DATE },
      deliveryDate: { type: Sequelize.DATE },
      shipNotice: { type: Sequelize.STRING },
      isAccepted: { type: Sequelize.BOOLEAN },
      deliveryNoteNumber: { type: Sequelize.STRING },
      isReturn: { type: Sequelize.BOOLEAN },
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

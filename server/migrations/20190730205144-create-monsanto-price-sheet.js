"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("MonsantoPriceSheets", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        identifier: {
          type: Sequelize.STRING
        },
        BuyerMonsantoId: {
          type: Sequelize.STRING
        },
        SellerMonsantoId: {
          type: Sequelize.STRING
        },
        zoneId: {
          type: Sequelize.STRING
        },
        cropType: {
          type: Sequelize.STRING
        },
        isSyncing: {
          type: Sequelize.BOOLEAN
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        lastUpdateDate: {
          type: Sequelize.JSON,
          allowNull: true
        },
        startRequestTimestamp: {
          type: Sequelize.JSON,
          allowNull: true
        },
        endRequestTimestamp: {
          type: Sequelize.JSON,
          allowNull: true
        }
      })
      .catch(err => console.log(err));
  },
  down: queryInterface => {
    return queryInterface.dropTable("MonsantoPriceSheets");
  }
};

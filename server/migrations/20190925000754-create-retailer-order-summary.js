"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("MonsantoRetailerOrderSummaries", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        currencyCode: {
          type: Sequelize.STRING
        },
        languageCode: {
          type: Sequelize.STRING
        },
        LastRequestDate: {
          type: Sequelize.DATE
        },
        ZoneId: {
          type: Sequelize.STRING
        },
        ProductClassification: {
          type: Sequelize.STRING
        },
        BuyerMonsantoId: {
          type: Sequelize.STRING
        },
        SellerMonsantoId: {
          type: Sequelize.STRING
        },
        isSynced: {
          type: Sequelize.BOOLEAN,
          default: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      })
      .catch(err => console.log(err));
  },
  down: queryInterface => {
    return queryInterface
      .dropTable("MonsantoRetailerOrderSummaries")
      .catch(err => console.log(err));
  }
};

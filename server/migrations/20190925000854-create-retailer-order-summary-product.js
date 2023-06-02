"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("MonsantoRetailerOrderSummaryProducts", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        ProductId: {
          // productIdentification
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "MonsantoProducts",
            key: "id"
          }
        },
        SummaryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "MonsantoRetailerOrderSummaries",
            key: "id"
          }
        },
        lineNumber: {
          type: Sequelize.STRING
        },
        totalRetailerProductQuantityValue: {
          type: Sequelize.DECIMAL
        },
        totalRetailerProductQuantityCode: {
          type: Sequelize.STRING
        },
        shippedQuantityValue: {
          type: Sequelize.DECIMAL
        },
        shippedQuantityCode: {
          type: Sequelize.STRING
        },
        scheduledToShipQuantityValue: {
          type: Sequelize.DECIMAL
        },
        scheduledToShipQuantityCode: {
          type: Sequelize.STRING
        },
        balanceToShipQuantityValue: {
          type: Sequelize.DECIMAL
        },
        balanceToShipQuantityCode: {
          type: Sequelize.STRING
        },
        positionQuantityValue: {
          type: Sequelize.DECIMAL
        },
        positionQuantityCode: {
          type: Sequelize.STRING
        },
        positionQuantityStatus: {
          type: Sequelize.ENUM("Short", "Long", "Zero")
        },
        transfersInQuantityValue: {
          type: Sequelize.DECIMAL
        },
        transfersInQuantityCode: {
          type: Sequelize.STRING
        },
        transfersOutQuantityValue: {
          type: Sequelize.DECIMAL
        },
        transfersOutQuantityCode: {
          type: Sequelize.STRING
        },
        returnsQuantityValue: {
          type: Sequelize.DECIMAL
        },
        returnsQuantityCode: {
          type: Sequelize.STRING
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
      .dropTable("MonsantoRetailerOrderSummaryProducts")
      .catch(err => console.log(err));
  }
};

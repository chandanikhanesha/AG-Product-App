"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("MonsantoProductBookingLineItems", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        lineNumber: {
          allowNull: false,
          type: Sequelize.STRING
        },
        orderLineItemNumber: {
          allowNull: false,
          type: Sequelize.STRING
        },
        increaseOrDecreaseType: {
          type: Sequelize.STRING
        },
        quantityChangeValue: {
          type: Sequelize.INTEGER
        },
        quantityChangeUnit: {
          type: Sequelize.STRING
        },
        quantityValue: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        quantityUnit: {
          allowNull: false,
          type: Sequelize.STRING
        },
        requestedShipDateTime: {
          type: Sequelize.DATE
        },
        potentialShipDateTime: {
          allowNull: false,
          type: Sequelize.DATE
        },
        specialInstructions: {
          type: Sequelize.TEXT
        },
        ProductId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "MonsantoProducts",
            key: "id"
          }
        },
        isDraft: {
          type: Sequelize.BOOLEAN
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
      .dropTable("MonsantoProductBookingLineItems")
      .catch(err => console.log(err));
  }
};

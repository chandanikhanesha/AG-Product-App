"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("CsvPricesheetProducts", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        suggestedDealerPrice: {
          allowNull: false,
          type: Sequelize.JSON
        },
        suggestedDealerCurrencyCode: {
          type: Sequelize.JSON,
          allowNull: false
        },
        suggestedDealerMeasurementValue: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        suggestedDealerMeasurementUnitCode: {
          allowNull: false,
          type: Sequelize.JSON
        },
        suggestedEndUserPrice: {
          allowNull: false,
          type: Sequelize.JSON
        },
        suggestedEndUserCurrencyCode: {
          type: Sequelize.JSON,
          allowNull: false
        },
        suggestedEndUserMeasurementValue: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        suggestedEndUserMeasurementUnitCode: {
          allowNull: false,
          type: Sequelize.JSON
        },
        zoneId: {
          type: Sequelize.ARRAY(Sequelize.STRING)
        },
        // ProductId: {
        //   allowNull: false,
        //   type: Sequelize.INTEGER,
        //   references: {
        //     model: "MonsantoProducts",
        //     key: "id"
        //   }
        // },
        treatment: {
          type: Sequelize.STRING
        },
        crossReferenceProductId: {
          allowNull: false,
          type: Sequelize.STRING
        },
        effectiveFrom: {
          allowNull: false,
          type: Sequelize.DATE
        },
        effectiveTo: {
          allowNull: false,
          type: Sequelize.DATE
        },
        organizationId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        lineNumber: {
          allowNull: false,
          type: Sequelize.INTEGER
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
      .dropTable("CsvPricesheetProducts ")
      .catch(err => console.log(err));
  }
};

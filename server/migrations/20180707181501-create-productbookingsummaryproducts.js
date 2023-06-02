"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("MonsantoProductBookingSummaryProducts", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        ProductId: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        BayerDealerBucketQty: {
            type: Sequelize.INTEGER,
        },
        AllGrowerQty: {
            type: Sequelize.INTEGER,
        },
        isChanged: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        OrganizationId: Sequelize.INTEGER,
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
        },
      })
      .catch(err => console.log(err));
  },
  down: queryInterface => {
    return queryInterface
      .dropTable("MonsantoProductBookingSummaryProducts")
      .catch(err => console.log(err));
  }
};

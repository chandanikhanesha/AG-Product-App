"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("CustomerMonsantoProducts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      MonsantoProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "MonsantoProducts",
          key: "id"
        }
      },
      PurchaseOrderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "PurchaseOrders",
          key: "id"
        }
      },
      FarmId: {
        type: Sequelize.INTEGER,
        // allowNull: false,
        // references: {
        //   model: "Farm",
        //   key: "id"
        // }
      },
      orderQty: {
        type: Sequelize.FLOAT
      },
      discounts: {
        type: Sequelize.JSON
      },
      shareholderData: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      orderDate: {
        type: Sequelize.DATE
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      OrganizationId: {
        type: Sequelize.INTEGER
      },
      msrpEdited: {
        type: Sequelize.DECIMAL
      },
      comment:{
        type: Sequelize.STRING
      },
      fieldName:{
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
    });
  },
  down: queryInterface => {
    return queryInterface.dropTable("CustomerMonsantoProducts");
  }
};

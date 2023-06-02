'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ReturnAllProducts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customerId: {
        type: Sequelize.INTEGER,

        references: {
          model: 'Customers',
          key: 'id'
        }
      },
      customProductId: {
        type: Sequelize.INTEGER,

        references: {
          model: 'CustomProducts',
          key: 'id'
        }
      },
      productId: {
        type: Sequelize.INTEGER,

        references: {
          model: 'Products',
          key: 'id'
        }
      },
      monsantoProductId: {
        type: Sequelize.INTEGER,

        references: {
          model: 'MonsantoProducts',
          key: 'id'
        }
      },
      purchaseOrderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "PurchaseOrders",
          key: "id"
        }
      },
      customerProductId:{
        type:Sequelize.INTEGER
        
      },

      returnOrderQty: {
        type: Sequelize.DECIMAL
      },
      organizationId:{
        type:Sequelize.INTEGER
      },
      lineNumber:{
        type:Sequelize.STRING

      },
      lineItemNumber:{
        type:Sequelize.STRING
       },
      unit:{
        type:Sequelize.STRING,
      },
      farmId:{
        type:Sequelize.INTEGER
      },
      monsantoOrderQty:{
        type:Sequelize.DECIMAL
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
      msrpEdited: {
        type: Sequelize.DECIMAL
      },
      comment:{
        type: Sequelize.STRING
      },
      fieldName:{
        type: Sequelize.STRING
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isSent:{
        type: Sequelize.BOOLEAN,
      },
      isReplant:{
        type: Sequelize.BOOLEAN,
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ReturnAllProducts');
  }
};

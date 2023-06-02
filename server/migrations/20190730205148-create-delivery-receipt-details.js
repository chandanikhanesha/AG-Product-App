'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('DeliveryReceiptDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amountDelivered: {
        type: Sequelize.DECIMAL
      },
      
      DeliveryReceiptId:{
        type: Sequelize.INTEGER,
        references: {
          model: 'DeliveryReceipts',
          key: 'id'
        }
      },

      LotId:{
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'Lots',
        //   key: 'id'
        // }
      },
      MonsantoLotId:{
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'MonsantoLots',
        //   key: 'id'
        // }
      },

      customProductId:{
        type: Sequelize.INTEGER,
        references: {
          model: 'CustomProducts',
          key: 'id'
        }
      },
      MonsantoProductId:{
        type: Sequelize.INTEGER,
        references: {
          model: 'MonsantoProducts',
          key: 'id'
        }
      },
      ProductId:{
        type: Sequelize.INTEGER,
        references: {
          model: 'Products',
          key: 'id'
        }
      },
      CustomLotId:{
        type: Sequelize.INTEGER,
        // references: {
        //   model: 'CustomLots',
        //   key: 'id'
        // }
      },
      PurchaseOrderId: {
        type: Sequelize.INTEGER
      },
      poCreated:{
        type: Sequelize.STRING
      },
      CustomerMonsantoProductId:{
        type:Sequelize.INTEGER
      },
      lineNumber: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lineItemNumber:{
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
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('DeliveryReceiptDetails');
  }
};
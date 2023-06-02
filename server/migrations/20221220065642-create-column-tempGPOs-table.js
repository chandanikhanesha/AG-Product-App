'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
return Promise.all([
          queryInterface.addColumn('TempGPOs', 'transactionStatusDescription', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('TempGPOs', 'invoiceDate', {
        type: Sequelize.DATE,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipDate', {
        type: Sequelize.DATE,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedReporterName', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedShipFromIdQual', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedShipFromIdValue', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedShipFromName', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipFromMonAccountId', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipFromMonGLN', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipFromMonName', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedShipToIdQual', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedShipToIdValue', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedShipToName', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedShipToCity', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedShipToState', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('TempGPOs', 'shipToMonAccountId', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipToMonGLN', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipToMonName', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipToMonShippingCity', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipToMonState', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'shipToMonLicenseStatus', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedProductToIdQual', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'reportedProductToIdValue', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'upcCode', {
        type: Sequelize.STRING,
        allowNull: true,
      }),queryInterface.addColumn('TempGPOs', 'reportedproductQty', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'ssuQty', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('TempGPOs', 'currentQty', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'docCtlId', {
        type: Sequelize.STRING,
        allowNull: true,
      }), queryInterface.addColumn('TempGPOs', 'conversationId', {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn('TempGPOs', 'fileName', {
        type: Sequelize.STRING,
        allowNull: true,
      })
 ])
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('TempGPOs');
  }
};

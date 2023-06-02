'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('TempGPOs', 'transactionStatus'),
      queryInterface.removeColumn('TempGPOs', 'reportedInvoiceDate'),
      queryInterface.removeColumn('TempGPOs', 'currentShipDate'),
     queryInterface.removeColumn('TempGPOs', 'currentInvoiceNumber'),
      queryInterface.removeColumn('TempGPOs', 'reporterMonAccTId'),
      queryInterface.removeColumn('TempGPOs', 'reporterMonEbid'),
      queryInterface.removeColumn('TempGPOs', 'reporterReportedName'),
      queryInterface.removeColumn('TempGPOs', 'sfReportedQualifier'),
      queryInterface.removeColumn('TempGPOs', 'sfReportedValue'),
      queryInterface.removeColumn('TempGPOs', 'sfReportedCity'),
      queryInterface.removeColumn('TempGPOs', 'sfReportedState'),
      queryInterface.removeColumn('TempGPOs', 'sfMonEbid'),
      queryInterface.removeColumn('TempGPOs', 'sfMonGLN'),
      queryInterface.removeColumn('TempGPOs', 'sfMonName'),
      queryInterface.removeColumn('TempGPOs', 'stReportedQualifier'),
      queryInterface.removeColumn('TempGPOs', 'stReportedName'),
      queryInterface.removeColumn('TempGPOs', 'stReportedCity'),
      queryInterface.removeColumn('TempGPOs', 'stReportedState'),
      queryInterface.removeColumn('TempGPOs', 'stMonGLN'),
      queryInterface.removeColumn('TempGPOs', 'stMonAccountId'),
      queryInterface.removeColumn('TempGPOs', 'stMonName'),
      queryInterface.removeColumn('TempGPOs', 'stMonCity'),
      queryInterface.removeColumn('TempGPOs', 'stMonState'),
      queryInterface.removeColumn('TempGPOs', 'productReportedQualifier'),
      queryInterface.removeColumn('TempGPOs', 'productReportedValue'),
      queryInterface.removeColumn('TempGPOs', 'productReportedDescription'),
      queryInterface.removeColumn('TempGPOs', 'productReportedQuantity'),
      queryInterface.removeColumn('TempGPOs', 'productReportedUOM'),
      queryInterface.removeColumn('TempGPOs', 'productMonUPC'),
      queryInterface.removeColumn('TempGPOs', 'productMonTraitDescription'),
      queryInterface.removeColumn('TempGPOs', 'productCurrentQty'),
      queryInterface.removeColumn('TempGPOs', 'productCurrentUOM'),
      queryInterface.removeColumn('TempGPOs', 'salesOrPkgQty'),
      queryInterface.removeColumn('TempGPOs', 'salesType'),
      queryInterface.removeColumn('TempGPOs', 'orderType'),
      queryInterface.removeColumn('TempGPOs', 'licenseStatusAllOthers'),
      queryInterface.removeColumn('TempGPOs', 'xmlConversationId'),
      queryInterface.removeColumn('TempGPOs', 'transactionSource'),
      queryInterface.removeColumn('TempGPOs', 'purchaseOrderId'),
      queryInterface.removeColumn('TempGPOs', 'indivisualDeliveryId'),
     
    ])












































  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable('TempGPOs');
  }
};

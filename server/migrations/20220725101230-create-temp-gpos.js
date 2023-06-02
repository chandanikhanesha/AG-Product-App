'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TempGPOs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
     

      TransactionId:  {
        type: Sequelize.STRING
      },
      TransactionStatus:  {
        type: Sequelize.STRING
      },
      LoadDate: {
  type: Sequelize.DATE
},
      ReportedInvoiceDate: {
  type: Sequelize.DATE
},
      ReportedShipDate: {
  type: Sequelize.DATE
},
      CurrentShipDate: {
  type: Sequelize.DATE
},
      ReportedInvoiceNumber:  {
        type: Sequelize.STRING
      },
      CurrentInvoiceNumber:  {
        type: Sequelize.STRING
      },
      ReporterMonAccTId:  {
        type: Sequelize.STRING
      },
      ReporterMonEbid:  {
        type: Sequelize.STRING
      },
      ReporterMonGLN:  {
        type: Sequelize.STRING
      },
      ReporterMonSapId:  {
        type: Sequelize.STRING
      },
      ReporterReportedName:  {
        type: Sequelize.STRING
      },
      ReporterMonName:  {
        type: Sequelize.STRING
      },
      SFReportedQualifier:  {
        type: Sequelize.STRING
      },
      SFReportedValue:  {
        type: Sequelize.STRING
      },
      SFReportedCity:  {
        type: Sequelize.STRING
      },
      SFReportedState:  {
        type: Sequelize.STRING
      },
      SFMonEbid:  {
        type: Sequelize.STRING
      },
      SFMonGLN:  {
        type: Sequelize.STRING
      },
      SFMonAccountId:  {
        type: Sequelize.STRING
      },
      SFMonName:  {
        type: Sequelize.STRING
      },
      STReportedQualifier:  {
        type: Sequelize.STRING
      },
      STReportedValue:  {
        type: Sequelize.STRING
      },
      STReportedName:  {
        type: Sequelize.STRING
      },
      STReportedCity:  {
        type: Sequelize.STRING
      },
      STReportedState:  {
        type: Sequelize.STRING
      },
      STMonGLN:  {
        type: Sequelize.STRING
      },
      STMonAccountId:  {
        type: Sequelize.STRING
      },
      STMonName:  {
        type: Sequelize.STRING
      },
      STMonCity:  {
        type: Sequelize.STRING
      },
      STMonState:  {
        type: Sequelize.STRING
      },
      ProductReportedQualifier:  {
        type: Sequelize.STRING
      },
      ProductReportedValue:  {
        type: Sequelize.STRING
      },
      ProductReportedDescription:  {
        type: Sequelize.STRING
      },
      ProductReportedQuantity:  {
        type: Sequelize.STRING
      },
      ProductReportedUOM:  {
        type: Sequelize.STRING
      },
      ProductMonUPC:  {
        type: Sequelize.STRING
      },
      ProductMonTraitDescription:  {
        type: Sequelize.STRING
      },
      ProductMonDescription:  {
        type: Sequelize.STRING
      },
      ProductCurrentQty:  {
        type: Sequelize.STRING
      },
      ProductCurrentUOM:  {
        type: Sequelize.STRING
      },
      SalesOrPkgQty:  {
        type: Sequelize.STRING
      },
      SalesType:  {
        type: Sequelize.STRING
      },
      OrderType:  {
        type: Sequelize.STRING
      },
      LicenseStatusAllOthers:  {
        type: Sequelize.STRING
      },
      XmlConversationId:  {
        type: Sequelize.STRING
      },
      TransactionSource:  {
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
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('TempGPOs');
  }
};

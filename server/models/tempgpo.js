'use strict';
module.exports = (sequelize, DataTypes) => {
  var TempGPOS = sequelize.define(
    'TempGPOS',
    {
      transactionId: DataTypes.STRING,
      transactionStatusDescription: DataTypes.STRING, //new

      loadDate: DataTypes.DATE,
      reportedShipDate: DataTypes.DATE,
      invoiceDate: DataTypes.DATE,
      shipDate: DataTypes.DATE,

      reportedInvoiceNumber: DataTypes.STRING,
      reportedReporterName: DataTypes.STRING,
      reporterMonAccountTId: DataTypes.STRING,
      reporterMonGLN: DataTypes.STRING,
      reporterMonName: DataTypes.STRING,
      reporterMonSapId: DataTypes.STRING,
      reportedShipFromIdQual: DataTypes.STRING, //new
      reportedShipFromIdValue: DataTypes.STRING, //new
      reportedShipFromName: DataTypes.STRING, //new

      shipFromMonAccountId: DataTypes.STRING, //new
      shipFromMonGLN: DataTypes.STRING, //new
      shipFromMonName: DataTypes.STRING, //new

      reportedShipToIdQual: DataTypes.STRING, //new
      reportedShipToIdValue: DataTypes.STRING, //new
      reportedShipToName: DataTypes.STRING, //new
      reportedShipToCity: DataTypes.STRING, //new
      reportedShipToState: DataTypes.STRING, //new

      shipToMonAccountId: DataTypes.STRING, //new
      shipToMonGLN: DataTypes.STRING, //new
      shipToMonName: DataTypes.STRING, //new

      shipToMonShippingCity: DataTypes.STRING, //new
      shipToMonState: DataTypes.STRING, //new
      shipToMonLicenseStatus: DataTypes.STRING, //new

      reportedProductToIdQual: DataTypes.STRING, //new
      reportedProductToIdValue: DataTypes.STRING, //new
      upcCode: DataTypes.STRING, //new

      productMonDescription: DataTypes.STRING,
      reportedproductQty: DataTypes.STRING, //new
      ssuQty: DataTypes.STRING, //new
      currentQty: DataTypes.STRING, //new
      docCtlId: DataTypes.STRING, //new
      conversationId: DataTypes.STRING, //new
      fileName: DataTypes.STRING, //new

      // reporterReportedName: DataTypes.STRING,
      // reporterMonName: DataTypes.STRING,
      // sfReportedQualifier: DataTypes.STRING,
      // sfReportedValue: DataTypes.STRING,
      // sfReportedCity: DataTypes.STRING,
      // sfReportedState: DataTypes.STRING,
      // sfMonEbid: DataTypes.STRING,
      // sfMonGLN: DataTypes.STRING,
      // sfMonAccountId: DataTypes.STRING,
      // sfMonName: DataTypes.STRING,
      // stReportedQualifier: DataTypes.STRING,
      // stReportedValue: DataTypes.STRING,
      // stReportedName: DataTypes.STRING,
      // stReportedCity: DataTypes.STRING,
      // stReportedState: DataTypes.STRING,
      // stMonGLN: DataTypes.STRING,
      // stMonAccountId: DataTypes.STRING,
      // stMonName: DataTypes.STRING,
      // stMonCity: DataTypes.STRING,
      // stMonState: DataTypes.STRING,
      // productReportedQualifier: DataTypes.STRING,
      // productReportedValue: DataTypes.STRING,
      // productReportedDescription: DataTypes.STRING,
      // productReportedQuantity: DataTypes.STRING,
      // productReportedUOM: DataTypes.STRING,
      // productMonUPC: DataTypes.STRING,
      // productMonTraitDescription: DataTypes.STRING,
      // productMonDescription: DataTypes.STRING,
      // productCurrentQty: DataTypes.STRING,
      // productCurrentUOM: DataTypes.STRING,
      // salesOrPkgQty: DataTypes.STRING,
      // salesType: DataTypes.STRING,
      // orderType: DataTypes.STRING,
      // licenseStatusAllOthers: DataTypes.STRING,
      // xmlConversationId: DataTypes.STRING,
      // transactionSource: DataTypes.STRING,
      // purchaseOrderId: DataTypes.INTEGER,
      // indivisualDeliveryId: DataTypes.STRING,
    },
    {},
  );

  return TempGPOS;
};

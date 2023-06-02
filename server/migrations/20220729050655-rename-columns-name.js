

   

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.renameColumn('ActionLogs', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('ApiSeedCompanies', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('Backups', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('Seasons', 'OrganizationId', 'organizationId');


    queryInterface.renameColumn('CustomEarlyPays', 'OrganizationId', 'organizationId');
  queryInterface.renameColumn('CustomEarlyPays', 'CustomerId', 'customerId');
  queryInterface.renameColumn('CustomEarlyPays', 'PurchaseOrderId', 'purchaseOrderId');

    queryInterface.renameColumn('CustomLots', 'OrganizationId', 'organizationId');
  queryInterface.renameColumn('CustomLots', 'LotNumber', 'lotNumber');
  queryInterface.renameColumn('CustomLots', 'CustomProductId', 'customProductId');
  queryInterface.renameColumn('CustomLots', 'PackagingId', 'packagingId');
  queryInterface.renameColumn('CustomLots', 'SeedSizeId', 'seedSizeId');

    queryInterface.renameColumn('CustomProducts', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('CustomProducts', 'CompanyId', 'companyId');
    queryInterface.renameColumn('CustomProducts', 'SeasonId', 'seasonId');

    queryInterface.renameColumn('CustomerCustomProducts', 'FarmId', 'farmId');
    queryInterface.renameColumn('CustomerCustomProducts', 'CustomerId', 'customerId');
    queryInterface.renameColumn('CustomerCustomProducts', 'PurchaseOrderId', 'purchaseOrderId');
    queryInterface.renameColumn('CustomerCustomProducts', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('CustomerCustomProducts', 'CustomProductId', 'customProductId');

    queryInterface.renameColumn('CustomerMonsantoProducts', 'FarmId', 'farmId');
    queryInterface.renameColumn('CustomerMonsantoProducts', 'MonsantoProductId', 'monsantoProductId');
    queryInterface.renameColumn('CustomerMonsantoProducts', 'PurchaseOrderId', 'purchaseOrderId');
    queryInterface.renameColumn('CustomerMonsantoProducts', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('CustomerMonsantoProducts', 'isDeteleSynced', 'isDeleteSynced');
    
    queryInterface.renameColumn('CustomerProducts', 'ProductId', 'productId');
    queryInterface.renameColumn('CustomerProducts', 'CustomerId', 'customerId');
    queryInterface.renameColumn('CustomerProducts', 'PurchaseOrderId', 'purchaseOrderId');
    queryInterface.renameColumn('CustomerProducts', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('CustomerProducts', 'FarmId', 'farmId');
    queryInterface.renameColumn('CustomerProducts', 'PackagingId', 'packagingId');
    queryInterface.renameColumn('CustomerProducts', 'SeedSizeId', 'seedSizeId');
    queryInterface.renameColumn('CustomerProducts', 'DeliveryReceiptDetailsId', 'deliveryReceiptDetailsId');

    queryInterface.renameColumn('Customers', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('DealerDiscounts', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('DealerDiscounts', 'SeedCompanyIds', 'seedCompanyIds');
    queryInterface.renameColumn('DealerDiscounts', 'APISeedCompanyIds', 'apiSeedCompanyIds');

    queryInterface.renameColumn('DelayProducts', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('DeliveryReceipts', 'PurchaseOrderId', 'purchaseOrderId');
    queryInterface.renameColumn('DeliveryReceipts', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('DeliveryReceiptDetails', 'PurchaseOrderId', 'purchaseOrderId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'DeliveryReceiptId', 'deliveryReceiptId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'ProductName', 'productName');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'LotId', 'lotId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'CustomProductId', 'customProductId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'CustomerMonsantoProductId', 'customerMonsantoProductId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'CustomLotId', 'customLotId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'MonsantoLotId', 'monsantoLotId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'MonsantoProductId', 'monsantoProductId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'ProductId', 'productId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'poCreated', 'purchaseOrderCreated');


    queryInterface.renameColumn('DiscountPackages', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('DiscountReports', 'PurchaseOrderId', 'purchaseOrderId');
    queryInterface.renameColumn('DiscountReports', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('Farms', 'CustomerId', 'customerId');

    queryInterface.renameColumn('FinanceMethods', 'OrganizationId', 'organizationId');

     queryInterface.renameColumn('InterestCharges', 'SeedCompanyId', 'seedCompanyId');
    queryInterface.renameColumn('InterestCharges', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('Lots', 'PackagingId', 'packagingId');
    queryInterface.renameColumn('Lots', 'SeedSizeId', 'seedSizeId');
    queryInterface.renameColumn('Lots', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('Lots', 'ProductId', 'productId');
    queryInterface.renameColumn('Lots', 'LotNumber', 'lotNumber');


    queryInterface.renameColumn('MonsantoFavoriteProducts', 'ProductId', 'productId');
    queryInterface.renameColumn('MonsantoFavoriteProducts', 'ApiSeedCompanyId', 'apiSeedCompanyId');

    queryInterface.renameColumn('MonsantoLots', 'PackagingId', 'packagingId');
    queryInterface.renameColumn('MonsantoLots', 'SeedSizeId', 'seedSizeId');
    queryInterface.renameColumn('MonsantoLots', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('MonsantoLots', 'MonsantoProductId', 'monsantoProductId');
    queryInterface.renameColumn('MonsantoLots', 'LotNumber', 'lotNumber');

    queryInterface.renameColumn('MonsantoOrderResponseLogs', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('MonsantoOrderResponseLogs', 'MonsantoProductId', 'monsantoProductId');

    queryInterface.renameColumn('MonsantoPriceSheets', 'BuyerMonsantoId', 'buyerMonsantoId');
    queryInterface.renameColumn('MonsantoPriceSheets', 'SellerMonsantoId', 'sellerMonsantoId');

    queryInterface.renameColumn('MonsantoProductBookingLineItems', 'ProductId', 'productId');

    queryInterface.renameColumn('MonsantoProductBookingSummaryProducts', 'ProductId', 'productId');
    queryInterface.renameColumn('MonsantoProductBookingSummaryProducts', 'BayerDealerBucketQty', 'bayerDealerBucketQty');
    queryInterface.renameColumn('MonsantoProductBookingSummaryProducts', 'AllGrowerQty', 'allGrowerQty');
    queryInterface.renameColumn('MonsantoProductBookingSummaryProducts', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('MonsantoProductLineItems', 'ProductId', 'productId');
    queryInterface.renameColumn('MonsantoProductLineItems', 'CrossRefProductId', 'crossReferenceProductId');
    queryInterface.renameColumn('MonsantoProductLineItems', 'OrganizationId', 'organizationId');

  queryInterface.renameColumn('MonsantoProducts', 'SeedCompanyId', 'seedCompanyId');
    queryInterface.renameColumn('MonsantoProducts', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('MonsantoReqLogs', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'BuyerMonsantoId', 'buyerMonsantoId');
    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'SellerMonsantoId', 'sellerMonsantoId');
    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'LastRequestDate', 'lastRequestDate');
    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'ZoneId', 'zoneId');
    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'ProductClassification', 'productClassification');

  queryInterface.renameColumn('MonsantoRetailerOrderSummaryProducts', 'ProductId', 'productId');
  queryInterface.renameColumn('MonsantoRetailerOrderSummaryProducts', 'SummaryId', 'summaryId');

  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'ProductId', 'productId');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'BayerDealerBucketQtyBefore', 'bayerDealerBucketQtyBefore');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'AllGrowerQtyBefore', 'allGrowerQtyBefore');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'BayerDealerBucketQty', 'bayerDealerBucketQty');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'AllGrowerQty', 'allGrowerQty');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'OrganizationId', 'organizationId');


  queryInterface.renameColumn('Notes', 'PurchaseOrderId', 'purchaseOrderId');
  queryInterface.renameColumn('Notes', 'OrganizationId', 'organizationId');
  queryInterface.renameColumn('Notes', 'CustomerId', 'customerId');

  queryInterface.renameColumn('Organizations', 'PartnerName', 'partnerName');
  queryInterface.renameColumn('Organizations', 'PartnerIdentifier', 'partnerIdentifier');
  queryInterface.renameColumn('Organizations', 'PartnerAddressLine', 'partnerAddressLine'); 
   queryInterface.renameColumn('Organizations', 'PartnerCityName', 'partnerCityName');
  queryInterface.renameColumn('Organizations', 'PartnerStateOrProvince', 'partnerStateOrProvince');
  queryInterface.renameColumn('Organizations', 'PartnerPostalCode', 'partnerPostalCode'); 
   queryInterface.renameColumn('Organizations', 'PartnerPostalCountry', 'partnerPostalCountry');
  queryInterface.renameColumn('Organizations', 'ZoneID', 'zoneID');
  queryInterface.renameColumn('Organizations', 'GLNnumber', 'glnNumber'); 
   queryInterface.renameColumn('Organizations', 'DeliveryAddressLine', 'deliveryAddressLine');
  queryInterface.renameColumn('Organizations', 'DeliveryCityName', 'deliveryCityName');
  queryInterface.renameColumn('Organizations', 'DeliveryStateOrProvince', 'deliveryStateOrProvince');
  queryInterface.renameColumn('Organizations', 'DeliveryPostalCode', 'deliveryPostalCode');
  queryInterface.renameColumn('Organizations', 'DeliveryPostalCountry', 'deliveryPostalCountry'); 


  queryInterface.renameColumn('Packagings', 'SeedCompanyId', 'seedCompanyId');
    queryInterface.renameColumn('Packagings', 'OrganizationId', 'organizationId');

  
    queryInterface.renameColumn('Payments', 'ShareholderId', 'shareholderId');
    queryInterface.renameColumn('Payments', 'PurchaseOrderId', 'purchaseOrderId');

    queryInterface.renameColumn('ProductDealers', 'OrganizationId', 'organizationId');
    

    queryInterface.renameColumn('ProductPackagings', 'PurchaseOrderId', 'purchaseOrderId');
    queryInterface.renameColumn('ProductPackagings', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('ProductPackagings', 'ProductId', 'productId');
    

    queryInterface.renameColumn('Products', 'SeedCompanyId', 'seedCompanyId');
    queryInterface.renameColumn('Products', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('Products', 'SeasonId', 'seasonId');
    queryInterface.renameColumn('Products', 'CompanyId', 'companyId');

    queryInterface.renameColumn('PurchaseOrderStatements', 'PurchaseOrderId', 'purchaseOrderId');
    queryInterface.renameColumn('PurchaseOrderStatements', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('PurchaseOrderStatements', 'StatementId', 'statementId');

    queryInterface.renameColumn('PurchaseOrders', 'InvoiceDueDate', 'invoiceDueDate');
    queryInterface.renameColumn('PurchaseOrders', 'InvoiceDate', 'invoiceDate');
    queryInterface.renameColumn('PurchaseOrders', 'PurchaseOrderStatementStatementId', 'purchaseOrderStatementStatementId');
    queryInterface.renameColumn('PurchaseOrders', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('PurchaseOrders', 'DealerDiscountIds', 'dealerDiscountIds');
    queryInterface.renameColumn('PurchaseOrders', 'DealerDiscounts', 'dealerDiscounts');
    queryInterface.renameColumn('PurchaseOrders', 'CustomerId', 'customerId');

    queryInterface.renameColumn('QuoteProducts', 'ProductId', 'productId');
    queryInterface.renameColumn('QuoteProducts', 'QuoteId', 'quoteId');
    
    queryInterface.renameColumn('Reports', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('Reports', 'DealerDiscountIds', 'dealerDiscountIds');

    queryInterface.renameColumn('SeedCompanies', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('Companies', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('SeedSizes', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('SeedSizes', 'SeedCompanyId', 'seedCompanyId');

    queryInterface.renameColumn('Shareholders', 'CustomerId', 'customerId');

    queryInterface.renameColumn('StatementSettings', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('Statements', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('Statements', 'CustomerId', 'customerId');
    queryInterface.renameColumn('Statements', 'PurchaseOrderStatementStatementId', 'purchaseOrderStatementStatementId');

    
  // queryInterface.renameColumn('TransferLogs', 'OrganizationId', 'organizationId');
  // queryInterface.renameColumn('TransferLogs', 'OtherDetail', 'otherDetail');
  
    
  queryInterface.renameColumn('Subscriptions', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('Users', 'OrganizationId', 'organizationId');

    queryInterface.renameColumn('TempPBRs', 'OrganizationId', 'organizationId');
    queryInterface.renameColumn('TempPBRs', 'SalesOrderReferenceNumber', 'salesOrderReferenceNumber');
    queryInterface.renameColumn('TempPBRs', 'LineNumber', 'lineNumber');
    queryInterface.renameColumn('TempPBRs', 'LineItemNumber', 'lineItemNumber');
    queryInterface.renameColumn('TempPBRs', 'CrossReferenceId', 'crossReferenceId');
    queryInterface.renameColumn('TempPBRs', 'ProductDetail', 'productDetail');


    queryInterface.renameColumn('TempGPOs', 'TransactionId', 'transactionId');
    queryInterface.renameColumn('TempGPOs', 'TransactionStatus', 'transactionStatus');
    queryInterface.renameColumn('TempGPOs', 'LoadDate', 'loadDate');
    queryInterface.renameColumn('TempGPOs', 'ReportedInvoiceDate', 'reportedInvoiceDate');
    queryInterface.renameColumn('TempGPOs', 'ReportedShipDate', 'reportedShipDate');
    queryInterface.renameColumn('TempGPOs', 'CurrentShipDate', 'currentShipDate');
    queryInterface.renameColumn('TempGPOs', 'ReportedInvoiceNumber', 'reportedInvoiceNumber');
    queryInterface.renameColumn('TempGPOs', 'CurrentInvoiceNumber', 'currentInvoiceNumber');
    queryInterface.renameColumn('TempGPOs', 'ReporterMonAccTId', 'reporterMonAccTId');
    queryInterface.renameColumn('TempGPOs', 'ReporterMonEbid', 'reporterMonEbid');
    queryInterface.renameColumn('TempGPOs', 'ReporterMonGLN', 'reporterMonGLN');
    queryInterface.renameColumn('TempGPOs', 'ReporterMonSapId', 'reporterMonSapId');
    queryInterface.renameColumn('TempGPOs', 'ReporterReportedName', 'reporterReportedName');
    queryInterface.renameColumn('TempGPOs', 'ReporterMonName', 'reporterMonName');
    queryInterface.renameColumn('TempGPOs', 'SFReportedQualifier', 'sfReportedQualifier');
    queryInterface.renameColumn('TempGPOs', 'SFReportedValue', 'sfReportedValue');
    queryInterface.renameColumn('TempGPOs', 'SFReportedCity', 'sfReportedCity');
    queryInterface.renameColumn('TempGPOs', 'SFReportedState', 'sfReportedState');
    queryInterface.renameColumn('TempGPOs', 'SFMonEbid', 'sfMonEbid');
    queryInterface.renameColumn('TempGPOs', 'SFMonGLN', 'sfMonGLN');
    queryInterface.renameColumn('TempGPOs', 'SFMonAccountId', 'sfMonAccountId');
    queryInterface.renameColumn('TempGPOs', 'SFMonName', 'sfMonName');
    queryInterface.renameColumn('TempGPOs', 'STReportedQualifier', 'stReportedQualifier');
    queryInterface.renameColumn('TempGPOs', 'STReportedValue', 'stReportedValue');
    queryInterface.renameColumn('TempGPOs', 'STReportedName', 'stReportedName');
    queryInterface.renameColumn('TempGPOs', 'STReportedCity', 'stReportedCity');
    queryInterface.renameColumn('TempGPOs', 'STReportedState', 'stReportedState');
    queryInterface.renameColumn('TempGPOs', 'STMonGLN', 'stMonGLN');
    queryInterface.renameColumn('TempGPOs', 'STMonAccountId', 'stMonAccountId');
    queryInterface.renameColumn('TempGPOs', 'STMonName', 'stMonName');
    queryInterface.renameColumn('TempGPOs', 'STMonCity', 'stMonCity');
    queryInterface.renameColumn('TempGPOs', 'STMonState', 'stMonState');
    queryInterface.renameColumn('TempGPOs', 'ProductReportedQualifier', 'productReportedQualifier');
queryInterface.renameColumn('TempGPOs', 'ProductReportedValue', 'productReportedValue');
queryInterface.renameColumn('TempGPOs', 'ProductReportedDescription', 'productReportedDescription');
queryInterface.renameColumn('TempGPOs', 'ProductReportedQuantity', 'productReportedQuantity');
queryInterface.renameColumn('TempGPOs', 'ProductReportedUOM', 'productReportedUOM');
queryInterface.renameColumn('TempGPOs', 'ProductMonUPC', 'productMonUPC');
queryInterface.renameColumn('TempGPOs', 'ProductMonTraitDescription', 'productMonTraitDescription');
queryInterface.renameColumn('TempGPOs', 'ProductMonDescription', 'productMonDescription');
queryInterface.renameColumn('TempGPOs', 'ProductCurrentQty', 'productCurrentQty');
queryInterface.renameColumn('TempGPOs', 'ProductCurrentUOM', 'productCurrentUOM');
queryInterface.renameColumn('TempGPOs', 'SalesOrPkgQty', 'salesOrPkgQty');
queryInterface.renameColumn('TempGPOs', 'SalesType', 'salesType');
queryInterface.renameColumn('TempGPOs', 'OrderType', 'orderType');
queryInterface.renameColumn('TempGPOs', 'LicenseStatusAllOthers', 'licenseStatusAllOthers');
queryInterface.renameColumn('TempGPOs', 'XmlConversationId', 'xmlConversationId');
queryInterface.renameColumn('TempGPOs', 'TransactionSource', 'transactionSource');



 queryInterface.changeColumn(
  'Backups',
  'pdfLink',
  Sequelize.TEXT
);








    return;
  },


  async down (queryInterface, Sequelize) {
    queryInterface.renameColumn('ActionLogs', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('ApiSeedCompanies', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('Backups', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('Seasons', 'organizationId', 'OrganizationId');


    queryInterface.renameColumn('CustomEarlyPays', 'organizationId', 'OrganizationId');
  queryInterface.renameColumn('CustomEarlyPays', 'customerId', 'CustomerId');
  queryInterface.renameColumn('CustomEarlyPays', 'purchaseOrderId', 'PurchaseOrderId');

    queryInterface.renameColumn('CustomLots', 'organizationId', 'OrganizationId');
  queryInterface.renameColumn('CustomLots', 'lotNumber', 'LotNumber');
  queryInterface.renameColumn('CustomLots', 'CustomProductId', 'customProductId');
  queryInterface.renameColumn('CustomLots', 'packagingId', 'PackagingId');
  queryInterface.renameColumn('CustomLots', 'seedSizeId', 'SeedSizeId');

    queryInterface.renameColumn('CustomProducts', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('CustomProducts', 'companyId', 'CompanyId');
    queryInterface.renameColumn('CustomProducts', 'seasonId', 'SeasonId');

    queryInterface.renameColumn('CustomerCustomProducts', 'farmId', 'FarmId');
    queryInterface.renameColumn('CustomerCustomProducts', 'customerId', 'CustomerId');
    queryInterface.renameColumn('CustomerCustomProducts', 'purchaseOrderId', 'PurchaseOrderId');
    queryInterface.renameColumn('CustomerCustomProducts', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('CustomerCustomProducts', 'CustomProductId', 'customProductId');

    queryInterface.renameColumn('CustomerMonsantoProducts', 'farmId', 'FarmId');
    queryInterface.renameColumn('CustomerMonsantoProducts', 'monsantoProductId', 'MonsantoProductId');
    queryInterface.renameColumn('CustomerMonsantoProducts', 'purchaseOrderId', 'PurchaseOrderId');
    queryInterface.renameColumn('CustomerMonsantoProducts', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('CustomerMonsantoProducts', 'isDeleteSynced', 'isDeteleSynced');
    
    queryInterface.renameColumn('CustomerProducts', 'productId', 'ProductId');
    queryInterface.renameColumn('CustomerProducts', 'customerId', 'CustomerId');
    queryInterface.renameColumn('CustomerProducts', 'purchaseOrderId', 'PurchaseOrderId');
    queryInterface.renameColumn('CustomerProducts', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('CustomerProducts', 'farmId', 'FarmId');
    queryInterface.renameColumn('CustomerProducts', 'packagingId', 'PackagingId');
    queryInterface.renameColumn('CustomerProducts', 'seedSizeId', 'SeedSizeId');
    queryInterface.renameColumn('CustomerProducts', 'deliveryReceiptDetailsId', 'DeliveryReceiptDetailsId');

    queryInterface.renameColumn('Customers', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('DealerDiscounts', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('DealerDiscounts', 'seedCompanyIds', 'SeedCompanyIds');
    queryInterface.renameColumn('DealerDiscounts', 'apiSeedCompanyIds', 'APISeedCompanyIds');

    queryInterface.renameColumn('DelayProducts', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('DeliveryReceipts', 'purchaseOrderId', 'PurchaseOrderId');
    queryInterface.renameColumn('DeliveryReceipts', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('DeliveryReceiptDetails', 'purchaseOrderId', 'PurchaseOrderId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'deliveryReceiptId', 'DeliveryReceiptId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'productName', 'ProductName');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'lotId', 'LotId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'customProductId', 'CustomProductId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'customerMonsantoProductId', 'CustomerMonsantoProductId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'customLotId', 'CustomLotId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'monsantoLotId', 'MonsantoLotId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'monsantoProductId', 'MonsantoProductId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'productId', 'ProductId');
    queryInterface.renameColumn('DeliveryReceiptDetails', 'purchaseOrderCreated', 'poCreated');

    queryInterface.renameColumn('DiscountPackages', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('DiscountReports', 'purchaseOrderId', 'PurchaseOrderId');
    queryInterface.renameColumn('DiscountReports', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('Farms', 'customerId', 'CustomerId');

    queryInterface.renameColumn('FinanceMethods', 'organizationId', 'OrganizationId');

     queryInterface.renameColumn('InterestCharges', 'SeedCompanyId', 'seedCompanyId');
    queryInterface.renameColumn('InterestCharges', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('Lots', 'packagingId', 'PackagingId');
    queryInterface.renameColumn('Lots', 'seedSizeId', 'SeedSizeId');
    queryInterface.renameColumn('Lots', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('Lots', 'productId', 'ProductId');
    queryInterface.renameColumn('Lots', 'lotNumber', 'LotNumber');


    queryInterface.renameColumn('MonsantoFavoriteProducts', 'productId', 'ProductId');
    queryInterface.renameColumn('MonsantoFavoriteProducts', 'apiSeedCompanyId', 'ApiSeedCompanyId');

    queryInterface.renameColumn('MonsantoLots', 'packagingId', 'PackagingId');
    queryInterface.renameColumn('MonsantoLots', 'seedSizeId', 'SeedSizeId');
    queryInterface.renameColumn('MonsantoLots', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('MonsantoLots', 'monsantoProductId', 'MonsantoProductId');
    queryInterface.renameColumn('MonsantoLots', 'lotNumber', 'LotNumber');

    queryInterface.renameColumn('MonsantoOrderResponseLogs', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('MonsantoOrderResponseLogs', 'monsantoProductId', 'MonsantoProductId');

    queryInterface.renameColumn('MonsantoPriceSheets', 'buyerMonsantoId', 'BuyerMonsantoId');
    queryInterface.renameColumn('MonsantoPriceSheets', 'sellerMonsantoId', 'SellerMonsantoId');

    queryInterface.renameColumn('MonsantoProductBookingLineItems', 'productId', 'ProductId');

    queryInterface.renameColumn('MonsantoProductBookingSummaryProducts', 'productId', 'ProductId');
    queryInterface.renameColumn('MonsantoProductBookingSummaryProducts', 'bayerDealerBucketQty', 'BayerDealerBucketQty');
    queryInterface.renameColumn('MonsantoProductBookingSummaryProducts', 'allGrowerQty', 'AllGrowerQty');
    queryInterface.renameColumn('MonsantoProductBookingSummaryProducts', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('MonsantoProductLineItems', 'productId', 'ProductId');
    queryInterface.renameColumn('MonsantoProductLineItems', 'crossRefProductId', 'CrossReferenceProductId');
    queryInterface.renameColumn('MonsantoProductLineItems', 'organizationId', 'OrganizationId');

  queryInterface.renameColumn('MonsantoProducts', 'SeedCompanyId', 'seedCompanyId');
    queryInterface.renameColumn('MonsantoProducts', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('MonsantoReqLogs', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'buyerMonsantoId', 'BuyerMonsantoId');
    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'sellerMonsantoId', 'SellerMonsantoId');
    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'lastRequestDate', 'LastRequestDate');
    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'zoneId', 'ZoneId');
    queryInterface.renameColumn('MonsantoRetailerOrderSummaries', 'productClassification', 'ProductClassification');

  queryInterface.renameColumn('MonsantoRetailerOrderSummaryProducts', 'productId', 'ProductId');
  queryInterface.renameColumn('MonsantoRetailerOrderSummaryProducts', 'SummaryId', 'summaryId');

  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'productId', 'ProductId');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'bayerDealerBucketQtyBefore', 'BayerDealerBucketQtyBefore');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'allGrowerQtyBefore', 'AllGrowerQtyBefore');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'bayerDealerBucketQty', 'BayerDealerBucketQty');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'allGrowerQty', 'AllGrowerQty');
  queryInterface.renameColumn('MonsantoSummarySyncHistories', 'organizationId', 'OrganizationId');


  queryInterface.renameColumn('Notes', 'purchaseOrderId', 'PurchaseOrderId');
  queryInterface.renameColumn('Notes', 'organizationId', 'OrganizationId');
  queryInterface.renameColumn('Notes', 'customerId', 'CustomerId');

  queryInterface.renameColumn('Organizations', 'partnerName', 'PartnerName');
  queryInterface.renameColumn('Organizations', 'partnerIdentifier', 'PartnerIdentifier');
  queryInterface.renameColumn('Organizations', 'partnerAddressLine', 'PartnerAddressLine'); 
   queryInterface.renameColumn('Organizations','partnerCityName', 'PartnerCityName');
  queryInterface.renameColumn('Organizations', 'partnerStateOrProvince', 'PartnerStateOrProvince');
  queryInterface.renameColumn('Organizations', 'partnerPostalCode', 'PartnerPostalCode'); 
   queryInterface.renameColumn('Organizations','partnerPostalCountry', 'PartnerPostalCountry');
  queryInterface.renameColumn('Organizations', 'zoneID', 'ZoneID');
  queryInterface.renameColumn('Organizations', 'glnnumber', 'GLNNumber'); 
   queryInterface.renameColumn('Organizations','deliveryAddressLine', 'DeliveryAddressLine');
  queryInterface.renameColumn('Organizations', 'deliveryCityName', 'DeliveryCityName');
  queryInterface.renameColumn('Organizations', 'deliveryStateOrProvince', 'DeliveryStateOrProvince');
  queryInterface.renameColumn('Organizations', 'deliveryPostalCode', 'DeliveryPostalCode');
  queryInterface.renameColumn('Organizations', 'deliveryPostalCountry', 'DeliveryPostalCountry'); 


  queryInterface.renameColumn('Packagings', 'SeedCompanyId', 'seedCompanyId');
    queryInterface.renameColumn('Packagings', 'organizationId', 'OrganizationId');

  
    queryInterface.renameColumn('Payments', 'shareholderId', 'ShareholderId');
    queryInterface.renameColumn('Payments', 'purchaseOrderId', 'PurchaseOrderId');

    queryInterface.renameColumn('ProductDealers', 'organizationId', 'OrganizationId');
    

    queryInterface.renameColumn('ProductPackagings', 'purchaseOrderId', 'PurchaseOrderId');
    queryInterface.renameColumn('ProductPackagings', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('ProductPackagings', 'productId', 'ProductId');
    

    queryInterface.renameColumn('Products', 'seedCompanyId', 'SeedCompanyId');
    queryInterface.renameColumn('Products', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('Products', 'seasonId', 'SeasonId');
    queryInterface.renameColumn('Products', 'companyId', 'CompanyId');

    queryInterface.renameColumn('PurchaseOrderStatements', 'purchaseOrderId', 'PurchaseOrderId');
    queryInterface.renameColumn('PurchaseOrderStatements', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('PurchaseOrderStatements', 'statementId', 'StatementId');

    queryInterface.renameColumn('PurchaseOrders', 'invoiceDueDate', 'InvoiceDueDate');
    queryInterface.renameColumn('PurchaseOrders', 'invoiceDate', 'InvoiceDate');
    queryInterface.renameColumn('PurchaseOrders', 'purchaseOrderStatementStatementId', 'PurchaseOrderStatementStatementId');
    queryInterface.renameColumn('PurchaseOrders', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('PurchaseOrders', 'dealerDiscountIds', 'DealerDiscountIds');
    queryInterface.renameColumn('PurchaseOrders', 'dealerDiscounts', 'DealerDiscounts');
    queryInterface.renameColumn('PurchaseOrders', 'customerId', 'CustomerId');

    queryInterface.renameColumn('QuoteProducts', 'productId', 'ProductId');
    queryInterface.renameColumn('QuoteProducts', 'quoteId', 'QuoteId');
    
    queryInterface.renameColumn('Reports', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('Reports', 'dealerDiscountIds', 'DealerDiscountIds');

    queryInterface.renameColumn('SeedCompanies', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('Companies', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('SeedSizes', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('SeedSizes', 'SeedCompanyId', 'SeedCompanyId');

    queryInterface.renameColumn('Shareholders', 'customerId', 'CustomerId');

    queryInterface.renameColumn('StatementSettings', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('Statements', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('Statements', 'customerId', 'CustomerId');
    queryInterface.renameColumn('Statements', 'purchaseOrderStatementStatementId', 'PurchaseOrderStatementStatementId');

    
  // queryInterface.renameColumn('TransferLogs', 'organizationId', 'OrganizationId');
  // queryInterface.renameColumn('TransferLogs', 'OtherDetail', 'otherDetail');
  
    
  queryInterface.renameColumn('Subscriptions', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('Users', 'organizationId', 'OrganizationId');

    queryInterface.renameColumn('TempPBRs', 'organizationId', 'OrganizationId');
    queryInterface.renameColumn('TempPBRs', 'salesOrderReferenceNumber', 'SalesOrderReferenceNumber');
    queryInterface.renameColumn('TempPBRs', 'lineNumber', 'LineNumber');
    queryInterface.renameColumn('TempPBRs', 'LlineItemNumber', 'LineItemNumber');
    queryInterface.renameColumn('TempPBRs', 'crossReferenceId', 'CrossReferenceId');
    queryInterface.renameColumn('TempPBRs', 'productDetail', 'ProductDetail');


    queryInterface.renameColumn('TempGPOs', 'transactionId', 'TransactionId');
    queryInterface.renameColumn('TempGPOs', 'transactionStatus', 'TransactionStatus');
    queryInterface.renameColumn('TempGPOs', 'loadDate', 'LoadDate');
    queryInterface.renameColumn('TempGPOs', 'reportedInvoiceDate', 'ReportedInvoiceDate');
    queryInterface.renameColumn('TempGPOs', 'reportedShipDate', 'ReportedShipDate');
    queryInterface.renameColumn('TempGPOs', 'currentShipDate', 'CurrentShipDate');
    queryInterface.renameColumn('TempGPOs', 'reportedInvoiceNumber', 'ReportedInvoiceNumber');
    queryInterface.renameColumn('TempGPOs', 'currentInvoiceNumber', 'CurrentInvoiceNumber');
    queryInterface.renameColumn('TempGPOs', 'reporterMonAccTId', 'ReporterMonAccTId');
    queryInterface.renameColumn('TempGPOs', 'reporterMonEbid', 'ReporterMonEbid');
    queryInterface.renameColumn('TempGPOs', 'reporterMonGLN', 'ReporterMonGLN');
    queryInterface.renameColumn('TempGPOs', 'reporterMonSapId', 'ReporterMonSapId');
    queryInterface.renameColumn('TempGPOs', 'reporterReportedName', 'ReporterReportedName');
    queryInterface.renameColumn('TempGPOs', 'reporterMonName', 'ReporterMonName');
    queryInterface.renameColumn('TempGPOs', 'sfReportedQualifier', 'SFReportedQualifier');
    queryInterface.renameColumn('TempGPOs', 'sfReportedValue', 'SFReportedValue');
    queryInterface.renameColumn('TempGPOs', 'sfReportedCity', 'SFReportedCity');
    queryInterface.renameColumn('TempGPOs', 'sfReportedState', 'sSFReportedState');
    queryInterface.renameColumn('TempGPOs', 'sfMonEbid', 'SFMonEbid');
    queryInterface.renameColumn('TempGPOs', 'sfMonGLN', 'SFMonGLN');
    queryInterface.renameColumn('TempGPOs', 'sfMonAccountId', 'SFMonAccountId');
    queryInterface.renameColumn('TempGPOs', 'sfMonName', 'SFMonName');
    queryInterface.renameColumn('TempGPOs', 'stReportedQualifier', 'STReportedQualifier');
    queryInterface.renameColumn('TempGPOs', 'stReportedValue', 'STReportedValue');
    queryInterface.renameColumn('TempGPOs', 'stReportedName', 'STReportedName');
    queryInterface.renameColumn('TempGPOs', 'stReportedCity', 'STReportedCity');
    queryInterface.renameColumn('TempGPOs', 'stReportedState', 'STReportedState');
    queryInterface.renameColumn('TempGPOs', 'stMonGLN', 'STMonGLN');
    queryInterface.renameColumn('TempGPOs', 'stMonAccountId', 'STMonAccountId');
    queryInterface.renameColumn('TempGPOs', 'stMonName', 'STMonName');
    queryInterface.renameColumn('TempGPOs', 'stMonCity', 'STMonCity');
    queryInterface.renameColumn('TempGPOs', 'stMonState', 'STMonState');
    queryInterface.renameColumn('TempGPOs', 'productReportedQualifier', 'ProductReportedQualifier');
queryInterface.renameColumn('TempGPOs', 'productReportedValue', 'ProductReportedValue');
queryInterface.renameColumn('TempGPOs', 'productReportedDescription', 'ProductReportedDescription');
queryInterface.renameColumn('TempGPOs', 'productReportedQuantity', 'ProductReportedQuantity');
queryInterface.renameColumn('TempGPOs', 'productReportedUOM', 'ProductReportedUOM');
queryInterface.renameColumn('TempGPOs', 'productMonUPC', 'ProductMonUPC');
queryInterface.renameColumn('TempGPOs', 'productMonTraitDescription', 'ProductMonTraitDescription');
queryInterface.renameColumn('TempGPOs', 'productMonDescription', 'ProductMonDescription');
queryInterface.renameColumn('TempGPOs', 'productCurrentQty', 'ProductCurrentQty');
queryInterface.renameColumn('TempGPOs', 'productCurrentUOM', 'ProductCurrentUOM');
queryInterface.renameColumn('TempGPOs', 'salesOrPkgQty', 'SalesOrPkgQty');
queryInterface.renameColumn('TempGPOs', 'salesType', 'SalesType');
queryInterface.renameColumn('TempGPOs', 'orderType', 'OrderType');
queryInterface.renameColumn('TempGPOs', 'licenseStatusAllOthers', 'LicenseStatusAllOthers');
queryInterface.renameColumn('TempGPOs', 'xmlConversationId', 'XmlConversationId');
queryInterface.renameColumn('TempGPOs', 'transactionSource', 'TransactionSource');


queryInterface.removeColumn(
  'Backups',
  'pdfLink'

)








    return;
  }
};

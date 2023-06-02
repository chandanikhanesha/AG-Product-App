'use strict';
module.exports = (sequelize, DataTypes) => {
  var ReturnAllProduct = sequelize.define('ReturnAllProduct', {
    customerId: DataTypes.INTEGER,
    customProductId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    monsantoProductId: DataTypes.INTEGER,
    purchaseOrderId: DataTypes.INTEGER,
    farmId: DataTypes.INTEGER,
    returnOrderQty: DataTypes.FLOAT,
    monsantoOrderQty: DataTypes.FLOAT,
    discounts: DataTypes.JSON,
    organizationId: DataTypes.INTEGER,
    shareholderData: DataTypes.JSON,
    orderDate: DataTypes.DATE,
    isSent: DataTypes.BOOLEAN, //sent to bayer API
    lineNumber: DataTypes.STRING,
    lineItemNumber: DataTypes.STRING,
    unit: DataTypes.STRING,
    isDeleted: DataTypes.BOOLEAN,
    msrpEdited: DataTypes.DECIMAL,
    // price: DataTypes.STRING,
    comment: DataTypes.STRING,
    fieldName: DataTypes.STRING,
    isReplant: DataTypes.BOOLEAN,
    customerProductId: DataTypes.INTEGER,
  });

  return ReturnAllProduct;
};

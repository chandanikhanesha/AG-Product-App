'use strict';
module.exports = (sequelize, DataTypes) => {
  var TempPBR = sequelize.define(
    'TempPBR',
    {
      organizationId: DataTypes.INTEGER,
      purchaseOrderId: DataTypes.INTEGER,
      salesOrderReferenceNumber: DataTypes.STRING,
      lineNumber: DataTypes.STRING,
      lineItemNumber: DataTypes.STRING,
      crossReferenceId: DataTypes.STRING,
      productDetail: DataTypes.STRING,
      quanity: DataTypes.FLOAT,
    },
    {},
  );

  return TempPBR;
};

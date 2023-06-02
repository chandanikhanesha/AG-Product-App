'use strict';
const { Model, INTEGER } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  var TransferLog = sequelize.define(
    'TransferLog',
    {
      organizationId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      userName: DataTypes.STRING,
      productName: DataTypes.STRING,
      action: DataTypes.JSON,
      otherDetail: DataTypes.JSON,
      purchaseOrderId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      rowId: DataTypes.INTEGER,
    },
    {},
  );
  return TransferLog;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  var PurchaseOrderStatement = sequelize.define(
    'PurchaseOrderStatement',
    {
      organizationId: DataTypes.INTEGER,
      statementId: DataTypes.INTEGER,
      statementNo: DataTypes.STRING,
      purchaseOrderId: DataTypes.INTEGER,
      isRemoved: DataTypes.BOOLEAN,
      isDeferred: DataTypes.BOOLEAN,
      deferredDate: DataTypes.DATE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
      statementData: DataTypes.ARRAY(DataTypes.JSON),
      totalAmount: DataTypes.FLOAT,
      reportUpdatedDate: DataTypes.DATE,
    },
    {},
  );
  PurchaseOrderStatement.associate = function (models) {
    // associations can be defined here
    PurchaseOrderStatement.hasMany(models.PurchaseOrder, { foreignKey: 'purchaseOrderStatementStatementId' });
    PurchaseOrderStatement.hasMany(models.Statement, { foreignKey: 'statementNo' });
  };

  PurchaseOrderStatement.softDestroy = (whereQuery) => {
    return PurchaseOrderStatement.update({ isDeleted: true }, { where: whereQuery });
  };

  return PurchaseOrderStatement;
};

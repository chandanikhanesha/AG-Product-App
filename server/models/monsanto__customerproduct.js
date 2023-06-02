'use strict';
module.exports = (sequelize, DataTypes) => {
  const CustomerMonsantoProduct = sequelize.define(
    'CustomerMonsantoProduct',
    {
      monsantoProductId: DataTypes.INTEGER,
      purchaseOrderId: DataTypes.INTEGER,
      farmId: DataTypes.INTEGER,
      orderQty: DataTypes.FLOAT,
      monsantoOrderQty: DataTypes.FLOAT,
      discounts: DataTypes.JSON,
      organizationId: DataTypes.INTEGER,
      shareholderData: DataTypes.JSON,
      orderDate: DataTypes.DATE,
      isSent: DataTypes.BOOLEAN, //sent to bayer API
      lineNumber: DataTypes.STRING,
      lineItemNumber: DataTypes.STRING,
      unit: DataTypes.INTEGER,
      isDeleted: DataTypes.BOOLEAN,
      isDeleteSynced: DataTypes.BOOLEAN,
      msrpEdited: DataTypes.DECIMAL,
      price: DataTypes.STRING,
      comment: DataTypes.STRING,
      fieldName: DataTypes.STRING,
      isReplant: DataTypes.BOOLEAN,
      isPickLater: DataTypes.BOOLEAN,
      pickLaterQty: DataTypes.FLOAT,
      pickLaterProductId: DataTypes.INTEGER,
    },
    {},
  );
  CustomerMonsantoProduct.associate = function (models) {
    CustomerMonsantoProduct.belongsTo(models.MonsantoProduct, { foreignKey: 'monsantoProductId' });
    CustomerMonsantoProduct.belongsTo(models.PurchaseOrder, {
      foreignKey: 'purchaseOrderId',
    });
    CustomerMonsantoProduct.belongsTo(models.Farm, { foreignKey: 'farmId' });
  };

  CustomerMonsantoProduct.softDestroy = (whereQuery) => {
    return CustomerMonsantoProduct.update({ isDeleted: true }, { where: whereQuery });
  };

  return CustomerMonsantoProduct;
};

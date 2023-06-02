'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerCustomProduct = sequelize.define('CustomerCustomProduct', {
    customerId: DataTypes.INTEGER,
    customProductId: DataTypes.INTEGER,
    purchaseOrderId: DataTypes.INTEGER,
    orderQty: DataTypes.DECIMAL,
    amountDelivered: DataTypes.DECIMAL,
    organizationId: DataTypes.INTEGER,
    discounts: DataTypes.JSON,
    farmId: DataTypes.INTEGER,
    fieldName: DataTypes.STRING,
    msrpEdited: DataTypes.DECIMAL,
    shareholderData: DataTypes.JSON,
    orderDate: DataTypes.DATE,
    isDeleted: DataTypes.BOOLEAN,
    comment: DataTypes.STRING,
    isReplant: DataTypes.BOOLEAN,
  });
  CustomerCustomProduct.associate = function (models) {
    // associations can be defined here
    CustomerCustomProduct.belongsTo(models.CustomProduct, { foreignKey: 'customProductId' });
    CustomerCustomProduct.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    CustomerCustomProduct.belongsTo(models.Farm, { foreignKey: 'farmId' });
  };

  CustomerCustomProduct.softDestroy = (whereQuery) => {
    return CustomerCustomProduct.update({ isDeleted: true }, { where: whereQuery });
  };

  return CustomerCustomProduct;
};

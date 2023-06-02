'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomerProduct = sequelize.define(
    'CustomerProduct',
    {
      customerId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      purchaseOrderId: DataTypes.INTEGER,
      orderQty: DataTypes.DECIMAL,
      amountDelivered: DataTypes.INTEGER,
      discounts: DataTypes.JSON,
      organizationId: DataTypes.INTEGER,
      farmId: DataTypes.INTEGER,
      fieldName: DataTypes.STRING,
      shareholderData: DataTypes.JSON,
      msrpEdited: DataTypes.DECIMAL,
      // seedSizeId: DataTypes.INTEGER,   // TODO: remove, not being used
      // packagingId: DataTypes.INTEGER,  // TODO: remove, not being used
      orderDate: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
      relatedCustomProducts: DataTypes.ARRAY(DataTypes.JSON),
      comment: DataTypes.STRING,
      isReplant: DataTypes.BOOLEAN,
    },
    {},
  );
  CustomerProduct.associate = function (models) {
    // associations can be defined here
    CustomerProduct.belongsTo(models.Product, { foreignKey: 'productId' });
    CustomerProduct.belongsTo(models.Farm, { foreignKey: 'farmId' });
    CustomerProduct.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    CustomerProduct.belongsTo(models.Customer, { foreignKey: 'customerId' });
    CustomerProduct.hasMany(models.DeliveryReceiptDetails);
  };

  CustomerProduct.softDestroy = (whereQuery) => {
    return CustomerProduct.update({ isDeleted: true }, { where: whereQuery });
  };

  return CustomerProduct;
};

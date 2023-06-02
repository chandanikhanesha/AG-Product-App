'use strict';
module.exports = (sequelize, DataTypes) => {
  var DeliveryReceipt = sequelize.define(
    'DeliveryReceipt',
    {
      name: DataTypes.STRING,
      purchaseOrderId: DataTypes.INTEGER,
      organizationId: DataTypes.INTEGER,
      isDeleted: DataTypes.BOOLEAN,
      deliveredBy: DataTypes.STRING,
      deliveredAt: DataTypes.DATE,
      isReturn: DataTypes.BOOLEAN,
      isSynce: DataTypes.BOOLEAN,
    },
    {},
  );
  DeliveryReceipt.associate = function (models) {
    // associations can be defined here
    DeliveryReceipt.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    DeliveryReceipt.hasMany(models.DeliveryReceiptDetails, { foreignKey: 'deliveryReceiptId' });
  };

  DeliveryReceipt.softDestroy = (whereQuery) => {
    return DeliveryReceipt.update({ isDeleted: true }, { where: whereQuery });
  };

  return DeliveryReceipt;
};

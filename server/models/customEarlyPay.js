'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomEarlyPay = sequelize.define(
    'CustomEarlyPay',
    {
      organizationId: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      purchaseOrderId: DataTypes.INTEGER,
      payByDate: DataTypes.DATE,
      payingLessAmount: DataTypes.INTEGER,
      remainingTotal: DataTypes.INTEGER,
    },
    {},
  );
  CustomEarlyPay.associate = function (models) {
    // associations can be defined here
    CustomEarlyPay.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
  };

  CustomEarlyPay.softDestroy = (whereQuery) => {
    return CustomEarlyPay.update({ isDeleted: true }, { where: whereQuery });
  };

  return CustomEarlyPay;
};

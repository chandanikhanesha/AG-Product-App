'use strict';
module.exports = (sequelize, DataTypes) => {
  var Payment = sequelize.define(
    'Payment',
    {
      purchaseOrderId: DataTypes.INTEGER,
      shareholderId: DataTypes.INTEGER,
      amount: DataTypes.DECIMAL,
      paymentDate: DataTypes.DATE,
      method: DataTypes.STRING,
      note: DataTypes.STRING,
      payBy: DataTypes.STRING,
      isDeleted: DataTypes.BOOLEAN,
      companyId: DataTypes.INTEGER,
      companyType: DataTypes.STRING,
      paymentHistory: DataTypes.STRING,
      multiCompanyData: DataTypes.JSON,
    },
    {},
  );
  Payment.associate = function (models) {
    // associations can be defined here
    Payment.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
  };

  Payment.softDestroy = (whereQuery) => {
    return Payment.update({ isDeleted: true }, { where: whereQuery });
  };

  return Payment;
};

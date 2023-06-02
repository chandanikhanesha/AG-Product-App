'use strict';
module.exports = (sequelize, DataTypes) => {
  var DiscountReport = sequelize.define(
    'DiscountReport',
    {
      organizationId: DataTypes.INTEGER,
      purchaseOrderId: DataTypes.INTEGER,
      discountJSON: DataTypes.JSON,
      isDeleted: DataTypes.BOOLEAN,
      isLoad: DataTypes.BOOLEAN,
    },
    {},
  );
  DiscountReport.associate = function (models) {
    DiscountReport.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    DiscountReport.belongsTo(models.Organization, { foreignKey: 'organizationId' });
  };
  DiscountReport.softDestroy = (id) => {
    return DiscountReport.update({ isDeleted: true }, { where: { id } });
  };
  return DiscountReport;
};

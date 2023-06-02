'use strict';
module.exports = (sequelize, DataTypes) => {
  var ProductPackaging = sequelize.define(
    'ProductPackaging',
    {
      organizationId: DataTypes.INTEGER,
      purchaseOrderId: DataTypes.INTEGER,
      productId: DataTypes.INTEGER,
      // packagingGroups: [{seedSizeId: number, packagingId: number, quantity: number}]
      packagingGroups: DataTypes.JSON,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  ProductPackaging.associate = function (models) {
    // associations can be defined here
    // ProductPackaging.hasMany(models.Packaging)
    ProductPackaging.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
  };

  ProductPackaging.softDestroy = (whereQuery) => {
    return ProductPackaging.update({ isDeleted: true }, { where: whereQuery });
  };

  return ProductPackaging;
};

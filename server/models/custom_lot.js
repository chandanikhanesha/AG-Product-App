'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomLot = sequelize.define('CustomLot', {
    quantity: DataTypes.INTEGER, // shipped
    customProductId: DataTypes.INTEGER,
    organizationId: DataTypes.INTEGER,
    lotNumber: DataTypes.STRING,
    seedSizeId: DataTypes.INTEGER,
    packagingId: DataTypes.INTEGER,
    duplicate: DataTypes.INTEGER,
    orderAmount: DataTypes.INTEGER,
    delivered: DataTypes.INTEGER,
    transfer: DataTypes.ENUM('in', 'out'),
    transferInfo: DataTypes.JSON,
    isDeleted: DataTypes.BOOLEAN,
    orderDate: DataTypes.DATE,
    source: DataTypes.STRING,
    dealerId: DataTypes.INTEGER,
    isReturn: DataTypes.BOOLEAN,
    shipNotice: DataTypes.STRING,
  });

  CustomLot.associate = function (models) {
    CustomLot.belongsTo(models.CustomProduct, { foreignKey: 'customProductId' });
    CustomLot.hasMany(models.DeliveryReceiptDetails, {
      foreignKey: 'customLotId',
      targetKey: 'customLotId',
    });
  };

  CustomLot.softDestroy = (whereQuery) => {
    let lotIds;
    return CustomLot.all({ where: whereQuery }).then((lots) => {
      lotIds = lots.map((l) => l.id);
      return Promise.all([
        CustomLot.update({ isDeleted: true }, { where: whereQuery }),
        sequelize.models.DeliveryReceiptDetails.softDestroy({ lotId: lotIds }),
      ]);
    });
  };

  return CustomLot;
};

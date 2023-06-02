'use strict';
module.exports = (sequelize, DataTypes) => {
  var Lot = sequelize.define('Lot', {
    quantity: DataTypes.INTEGER, // shipped
    productId: DataTypes.INTEGER,
    organizationId: DataTypes.INTEGER,
    lotNumber: DataTypes.STRING,
    seedSizeId: DataTypes.INTEGER,
    packagingId: DataTypes.INTEGER,
    duplicate: DataTypes.INTEGER,
    orderAmount: DataTypes.INTEGER,
    transfer: DataTypes.ENUM('in', 'out'),
    transferInfo: DataTypes.JSON,
    isDeleted: DataTypes.BOOLEAN,
    orderDate: DataTypes.DATE,
    source: DataTypes.ENUM('Seed Company', 'Seed Dealer Transfer In', 'Seed Dealer Transfer Out'),
    dealerId: DataTypes.INTEGER,
    isReturn: DataTypes.BOOLEAN,
    shipNotice: DataTypes.STRING,
  });

  Lot.associate = function (models) {
    Lot.belongsTo(models.Product, { foreignKey: 'productId' });
    Lot.hasMany(models.DeliveryReceiptDetails, {
      foreignKey: 'lotId',
      targetKey: 'lotId',
    });
  };

  Lot.softDestroy = (whereQuery) => {
    let lotIds;
    return Lot.all({ where: whereQuery }).then((lots) => {
      lotIds = lots.map((l) => l.id);
      return Promise.all([
        Lot.update({ isDeleted: true }, { where: whereQuery }),
        sequelize.models.DeliveryReceiptDetails.softDestroy({ lotId: lotIds }),
      ]);
    });
  };

  return Lot;
};

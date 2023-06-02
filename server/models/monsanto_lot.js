'use strict';
module.exports = (sequelize, DataTypes) => {
  var MonsantoLot = sequelize.define('MonsantoLot', {
    quantity: DataTypes.DECIMAL, // shipped
    receivedQty: DataTypes.DECIMAL,
    monsantoProductId: DataTypes.INTEGER,
    organizationId: DataTypes.INTEGER,
    lotNumber: DataTypes.STRING,
    seedSizeId: DataTypes.INTEGER,
    packagingId: DataTypes.INTEGER,
    duplicate: DataTypes.INTEGER,
    orderAmount: DataTypes.INTEGER,
    delivered: DataTypes.INTEGER,
    transfer: DataTypes.ENUM('in', 'out'),
    transferInfo: DataTypes.JSON,
    lineNumber: DataTypes.STRING,
    isDeleted: DataTypes.BOOLEAN,
    orderDate: DataTypes.DATE,
    source: DataTypes.STRING,
    dealerId: DataTypes.STRING,
    dealerName: DataTypes.STRING,
    dealerAddress: DataTypes.STRING,
    crossReferenceId: DataTypes.STRING,
    grossVolume: DataTypes.STRING,
    netWeight: DataTypes.STRING,
    shipDate: DataTypes.DATE,
    deliveryDate: DataTypes.DATE,
    shipNotice: DataTypes.STRING,
    isAccepted: DataTypes.BOOLEAN,
    deliveryNoteNumber: DataTypes.STRING,
    isNew: DataTypes.BOOLEAN,
    isReturn: DataTypes.BOOLEAN,
    transferId: DataTypes.STRING,
  });

  MonsantoLot.associate = function (models) {
    MonsantoLot.belongsTo(models.MonsantoProduct, {
      as: 'Product',
      foreignKey: 'monsantoProductId',
    });
  };

  MonsantoLot.softDestroy = (whereQuery) => {
    let lotIds;
    return MonsantoLot.all({ where: whereQuery }).then((lots) => {
      lotIds = lots.map((l) => l.id);
      return Promise.all([
        MonsantoLot.update({ isDeleted: true }, { where: whereQuery }),
        sequelize.models.DeliveryReceiptDetails.softDestroy({ lotId: lotIds }),
      ]);
    });
  };

  return MonsantoLot;
};

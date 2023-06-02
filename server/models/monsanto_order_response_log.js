'use strict';
module.exports = (sequelize, DataTypes) => {
  var MonsantoOrderResponseLog = sequelize.define(
    'MonsantoOrderResponseLog',
    {
      quantity: DataTypes.DECIMAL, // shipped
      increaseDecrease: DataTypes.DECIMAL,
      monsantoProductId: DataTypes.INTEGER,
      organizationId: DataTypes.INTEGER,
      comments: DataTypes.ARRAY(DataTypes.STRING),
      crossReferenceId: DataTypes.STRING,
      soldTo: DataTypes.STRING,
      increaseDecreaseDateTime: DataTypes.DATE,
    },
    {},
  );

  MonsantoOrderResponseLog.associate = function (models) {
    MonsantoOrderResponseLog.belongsTo(models.MonsantoProduct, {
      as: 'Product',
      foreignKey: 'monsantoProductId',
    });
  };

  MonsantoOrderResponseLog.softDestroy = (whereQuery) => {
    let lotIds;
    return MonsantoOrderResponseLog.all({ where: whereQuery }).then((lots) => {
      lotIds = lots.map((l) => l.id);
      return Promise.all([
        MonsantoOrderResponseLog.update({ isDeleted: true }, { where: whereQuery }),
        sequelize.models.DeliveryReceiptDetails.softDestroy({ lotId: lotIds }),
      ]);
    });
  };

  return MonsantoOrderResponseLog;
};

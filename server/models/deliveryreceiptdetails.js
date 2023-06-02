'use strict';
module.exports = (sequelize, DataTypes) => {
  var DeliveryReceiptDetails = sequelize.define('DeliveryReceiptDetails', {
    amountDelivered: DataTypes.DECIMAL,
    deliveryReceiptId: DataTypes.INTEGER,
    lotId: DataTypes.INTEGER,
    monsantoLotId: DataTypes.INTEGER,
    customLotId: DataTypes.INTEGER,
    customProductId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    monsantoProductId: DataTypes.INTEGER,
    purchaseOrderId: DataTypes.INTEGER,
    purchaseOrderCreated: DataTypes.STRING,
    lineNumber: DataTypes.STRING,
    lineItemNumber: DataTypes.INTEGER,
    isDeleted: DataTypes.BOOLEAN,
    customerMonsantoProductId: DataTypes.INTEGER,
    crossReferenceId: DataTypes.STRING,
  });
  DeliveryReceiptDetails.associate = function (models) {
    // associations can be defined here
    DeliveryReceiptDetails.belongsTo(models.DeliveryReceipt, { foreignKey: 'deliveryReceiptId' });
    DeliveryReceiptDetails.belongsTo(models.Lot, { foreignKey: 'lotId' });
    DeliveryReceiptDetails.belongsTo(models.MonsantoLot, { foreignKey: 'monsantoLotId' });
    DeliveryReceiptDetails.belongsTo(models.CustomLot, { foreignKey: 'customLotId' });
    DeliveryReceiptDetails.belongsTo(models.CustomerMonsantoProduct, { foreignKey: 'customerMonsantoProductId' });
  };

  DeliveryReceiptDetails.softDestroy = (whereQuery) => {
    return DeliveryReceiptDetails.update({ isDeleted: true }, { where: whereQuery });
  };

  return DeliveryReceiptDetails;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  var Backup = sequelize.define(
    'Backup',
    {
      organizationId: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      purchaseOrderId: DataTypes.INTEGER,
      pdfLink: DataTypes.TEXT,
      seasonYear: DataTypes.STRING,
      isDelivery: DataTypes.BOOLEAN,
    },
    {},
  );

  return Backup;
};

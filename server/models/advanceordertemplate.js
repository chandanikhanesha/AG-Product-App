'use strict';
module.exports = (sequelize, DataTypes) => {
  const AdvanceOrderTemplate = sequelize.define(
    'AdvanceOrderTemplate',
    {
      farmName: DataTypes.STRING,
      farmId: DataTypes.INTEGER,
      orderName: DataTypes.STRING,
      orderId: DataTypes.INTEGER,
      shareHolderData: DataTypes.JSON,
      customerId: DataTypes.INTEGER,

      organizationId: DataTypes.INTEGER,
    },
    {},
  );
  AdvanceOrderTemplate.associate = function (models) {};
  return AdvanceOrderTemplate;
};

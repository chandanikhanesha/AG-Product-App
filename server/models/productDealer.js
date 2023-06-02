'use strict';
module.exports = (sequelize, DataTypes) => {
  var ProductDealer = sequelize.define(
    'ProductDealer',
    {
      organizationId: DataTypes.INTEGER,
      companyType: DataTypes.STRING,
      companyId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      notes: DataTypes.STRING,
      phone: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.STRING,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  ProductDealer.associate = function (models) {
    // associations can be defined here
  };

  ProductDealer.softDestroy = (id) => {
    return ProductDealer.update({ isDeleted: true }, { where: { id } });
  };

  return ProductDealer;
};

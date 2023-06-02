'use strict';
module.exports = (sequelize, DataTypes) => {
  var DelayProduct = sequelize.define(
    'DelayProduct',
    {
      name: DataTypes.STRING,
      seedCompanyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      companyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      delayMethod: DataTypes.STRING,
      fixedDate: DataTypes.DATE,
      certainDays: DataTypes.INTEGER,
      organizationId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  DelayProduct.associate = function (models) {
    // associations can be defined here
  };

  DelayProduct.softDestroy = (whereQuery) => {
    return DelayProduct.update({ isDeleted: true }, { where: whereQuery });
  };

  return DelayProduct;
};

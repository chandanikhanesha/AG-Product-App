'use strict';
module.exports = (sequelize, DataTypes) => {
  var DiscountPackage = sequelize.define(
    'DiscountPackage',
    {
      name: DataTypes.STRING,
      organizationId: DataTypes.INTEGER,
      dealerDiscountIds: DataTypes.ARRAY(DataTypes.INTEGER),
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  DiscountPackage.associate = function (models) {
    // associations can be defined here
  };

  return DiscountPackage;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  var InterestCharge = sequelize.define(
    'InterestCharge',
    {
      seedCompanyId: DataTypes.INTEGER,
      certainDays: DataTypes.INTEGER,
      compoundingDays: DataTypes.INTEGER,
      interestCharge: DataTypes.INTEGER,
      productCategories: DataTypes.ARRAY(DataTypes.STRING),
      companyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      name: DataTypes.STRING,
      fixedDate: DataTypes.DATE,
      applyToWholeOrder: DataTypes.BOOLEAN,
      applyToFixedDate: DataTypes.BOOLEAN,
      applyToCertainDate: DataTypes.BOOLEAN,
      organizationId: DataTypes.INTEGER,
      useByDefault: DataTypes.BOOLEAN,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  InterestCharge.associate = function (models) {
    // associations can be defined here
  };

  InterestCharge.softDestroy = (whereQuery) => {
    return InterestCharge.update({ isDeleted: true }, { where: whereQuery });
  };

  return InterestCharge;
};

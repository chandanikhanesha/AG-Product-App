'use strict';
module.exports = (sequelize, DataTypes) => {
  var DealerDiscount = sequelize.define(
    'DealerDiscount',
    {
      // productCategories: DataTypes.ARRAY(DataTypes.STRING),
      productCategories: DataTypes.JSONB,
      companyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      name: DataTypes.STRING,
      lastDate: DataTypes.DATE,
      discountStrategy: DataTypes.STRING,
      detail: DataTypes.JSONB,
      applyToWholeOrder: DataTypes.BOOLEAN,
      perProductOrder: DataTypes.BOOLEAN,
      applyAsOverAllTotal: DataTypes.BOOLEAN,
      applyToSeedType: DataTypes.BOOLEAN,
      applyToParticularProducts: DataTypes.BOOLEAN,
      applyParticularProducts: DataTypes.JSONB,
      organizationId: DataTypes.INTEGER,
      useByDefault: DataTypes.BOOLEAN,
      // seedCompanyId: DataTypes.INTEGER,
      seedCompanyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      apiSeedCompanyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  DealerDiscount.associate = function (models) {
    // associations can be defined here
  };

  DealerDiscount.softDestroy = (whereQuery) => {
    let whereQuerytest = [whereQuery];
    DealerDiscount.update({ isDeleted: true }, { where: whereQuerytest }).then((data) => {
      return new Promise((resolve, reject));
    });
  };

  return DealerDiscount;
};

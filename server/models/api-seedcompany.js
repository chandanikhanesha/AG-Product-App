'use strict';
module.exports = (sequelize, DataTypes) => {
  const ApiSeedCompany = sequelize.define(
    'ApiSeedCompany',
    {
      name: DataTypes.STRING,
      lastSelectedFavOption: DataTypes.BOOLEAN,
      lastSelectedColumnSummaryOption: DataTypes.ARRAY(DataTypes.STRING),
      lastSelectedColumnDetailOption: DataTypes.ARRAY(DataTypes.STRING),
      lastSelectedColumnPricesheetOption: DataTypes.ARRAY(DataTypes.STRING),
      cornBrandName: DataTypes.STRING,
      soybeanBrandName: DataTypes.STRING,
      sorghumBrandName: DataTypes.STRING,
      alfalfaBrandName: DataTypes.STRING,
      canolaBrandName: DataTypes.STRING,
      organizationId: DataTypes.INTEGER,
      isDeleted: DataTypes.BOOLEAN,
      metadata: DataTypes.JSON,
      zoneIds: DataTypes.JSON,
      technologyId: DataTypes.STRING,
      glnId: DataTypes.STRING,
      password: DataTypes.STRING,
      username: DataTypes.STRING,
    },
    {},
  );

  ApiSeedCompany.associate = function (models) {
    ApiSeedCompany.hasMany(models.MonsantoProduct, {
      as: 'Products',
      foreignKey: 'seedCompanyId',
    });
    ApiSeedCompany.hasMany(models.MonsantoFavoriteProduct, {
      as: 'MonsantoFavoriteProducts',
      foreignKey: 'apiSeedCompanyId',
    });
  };

  ApiSeedCompany.prototype.softDestroy = (seedCompanyId) => {
    return Promise.all([
      sequelize.models.DealerDiscount.softDestroy({ seedCompanyId }),
      sequelize.models.Packaging.softDestroy({ seedCompanyId }),
      sequelize.models.Product.softDestroy({ seedCompanyId }),
    ]);
  };

  return ApiSeedCompany;
};

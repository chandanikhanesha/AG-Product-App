'use strict';
module.exports = (sequelize, DataTypes) => {
  var SeedCompany = sequelize.define(
    'SeedCompany',
    {
      name: DataTypes.STRING,
      cornBrandName: DataTypes.STRING,
      soybeanBrandName: DataTypes.STRING,
      sorghumBrandName: DataTypes.STRING,
      canolaBrandName: DataTypes.STRING,
      alfalfaBrandName: DataTypes.STRING,
      organizationId: DataTypes.INTEGER,
      isDeleted: DataTypes.BOOLEAN,
      metadata: DataTypes.JSON,
    },
    {},
  );

  SeedCompany.associate = function (models) {
    // associations can be defined here
    // SeedCompany.belongsTo(models.Organization, {
    //   foreign_key: 'organizationId'
    // })
    SeedCompany.hasMany(models.SeedSize, { foreignKey: 'seedCompanyId' });
    SeedCompany.hasMany(models.Product, { foreignKey: 'seedCompanyId' });
    SeedCompany.hasMany(models.Packaging, { foreignKey: 'seedCompanyId' });
  };

  SeedCompany.prototype.softDestroy = (seedCompanyId) => {
    console.log(seedCompanyId, 'this is whatwe get');
    return new Promise((resolve, reject) => {
      const seedCompanyIds = seedCompanyId;
      // sequelize.models.DealerDiscount.softDestroy({ seedCompanyIds })
      //   .then(() => console.log("dealer working"))
      //   .catch((e) => {
      //     console.log("something went wrong in dealer")
      //     return reject(e);
      //   });
      // sequelize.models.Packaging.softDestroy({ seedCompanyId })
      //   .then(() => console.log("packaging working"))
      //   .catch((e) => {
      //     console.log("something went wrong in packaging")
      //     return reject(e);
      //   });
      // sequelize.models.Product.softDestroy({ seedCompanyId })
      //   .then(() => console.log("Product working"))
      //   .catch((e) => {
      //     console.log("something went wrong in Product")
      //     return reject(e);
      //   });

      //   return resolve()

      return Promise.all([
        sequelize.models.DealerDiscount.softDestroy({ seedCompanyIds }),
        sequelize.models.Packaging.softDestroy({ seedCompanyId }),
        sequelize.models.Product.softDestroy({ seedCompanyId }),
      ])
        .then(() => resolve())
        .catch((e) => reject(e));
    });
  };

  return SeedCompany;
};

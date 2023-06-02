'use strict';
module.exports = (sequelize, { BOOLEAN }) => {
  const MonsantoFavoriteProduct = sequelize.define(
    'MonsantoFavoriteProduct',
    {
      isDeleted: BOOLEAN,
    },
    {},
  );

  MonsantoFavoriteProduct.associate = (models) => {
    models.MonsantoFavoriteProduct.belongsTo(models.ApiSeedCompany, {
      foreignKey: 'apiSeedCompanyId',
    });
    models.MonsantoFavoriteProduct.belongsTo(models.MonsantoProduct, {
      as: 'Product',
      foreignKey: 'productId',
    });
  };

  return MonsantoFavoriteProduct;
};

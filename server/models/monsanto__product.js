'use strict';
module.exports = (sequelize, { ENUM, DECIMAL, ARRAY, STRING, INTEGER, BOOLEAN, DATE }) => {
  const MonsantoProduct = sequelize.define(
    'MonsantoProduct',
    {
      classification: ENUM('C', 'S', 'B', 'A', 'L'), // corn, sorghum, soybean, alfalfa , canola
      packaging: STRING,
      seedSize: STRING,
      brand: STRING,
      blend: STRING,
      treatment: STRING,
      //UpcId: STRING,
      //AssignedBySellerId: STRING,
      crossReferenceId: STRING,
      organizationId: INTEGER,
      seedCompanyId: INTEGER,
      productDetail: STRING,
      quantity: STRING,
      syncQuantityDate: DATE,
      isFavorite: BOOLEAN,
      isDeletedInBayer: BOOLEAN,
      zoneId: ARRAY(STRING),
    },
    {},
  );

  MonsantoProduct.associate = (models) => {
    models.MonsantoProduct.belongsTo(models.ApiSeedCompany, {
      foreignKey: 'seedCompanyId',
    });
    models.MonsantoProduct.hasOne(models.MonsantoProductLineItem, {
      as: 'LineItem',
      foreignKey: 'productId',
    });
    models.MonsantoProduct.hasOne(models.MonsantoProductBookingLineItem, {
      as: 'BookingLineItem',
      foreignKey: 'productId',
    });

    MonsantoProduct.hasMany(models.MonsantoLot, { as: 'monsantoLots', foreignKey: 'monsantoProductId' });
  };

  return MonsantoProduct;
};

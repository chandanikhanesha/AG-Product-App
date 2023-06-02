'use strict';
module.exports = (sequelize, { ENUM, DECIMAL, STRING, INTEGER, BOOLEAN, DATE }) => {
  const CsvMonsantoProduct = sequelize.define(
    'CsvMonsantoProduct',
    {
      classification: ENUM('C', 'S', 'B', 'A', 'L'), // corn, sorghum, soybean, alfalfa , canola
      packaging: STRING,
      seedSize: STRING,
      brand: STRING,
      blend: STRING,

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
    },
    {},
  );

  CsvMonsantoProduct.associate = (models) => {
    models.CsvMonsantoProduct.belongsTo(models.ApiSeedCompany, {
      foreignKey: 'seedCompanyId',
    });
    // models.CsvMonsantoProduct.hasOne(models.MonsantoProductLineItem, {
    //   as: 'LineItem',
    //   foreignKey: 'productId',
    // });
  };

  return CsvMonsantoProduct;
};

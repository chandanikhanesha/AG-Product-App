('use strict');
module.exports = (sequelize, { ENUM, DECIMAL, STRING, INTEGER, BOOLEAN, DATE }) => {
  const TempTableMonsantoFavProduct = sequelize.define(
    'TempTableMonsantoFavProduct',
    {
      classification: ENUM('C', 'S', 'B', 'A', 'L'), // corn, sorghum, soybean, alfalfa , canola
      packaging: STRING,
      seedSize: STRING,
      brand: STRING,
      blend: STRING,
      treatment: STRING,
      productDetail: STRING,
      quantity: DECIMAL,
      syncQuantityDate: DATE,
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

  return TempTableMonsantoFavProduct;
};

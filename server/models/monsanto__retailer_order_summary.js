'use strict';
module.exports = (sequelize, { ENUM, STRING, INTEGER, DATE, BOOLEAN }) => {
  const MonsantoRetailerOrderSummary = sequelize.define(
    'MonsantoRetailerOrderSummary',
    {
      currencyCode: STRING,
      languageCode: STRING,
      lastRequestDate: DATE,
      zoneId: STRING,
      productClassification: STRING,
      buyerMonsantoId: STRING,
      sellerMonsantoId: STRING,
      isSynced: {
        type: BOOLEAN,
        default: false,
      },
    },
    {},
  );

  MonsantoRetailerOrderSummary.associate = (models) => {
    MonsantoRetailerOrderSummary.hasMany(models.MonsantoRetailerOrderSummaryProduct, {
      as: 'products',
      foreignKey: 'summaryId',
    });
  };

  return MonsantoRetailerOrderSummary;
};

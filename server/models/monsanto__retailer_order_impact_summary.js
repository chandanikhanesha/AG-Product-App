'use strict';
module.exports = (sequelize, { ENUM, STRING, INTEGER, DATE }) => {
  const MonsantoRetailerOrderImpactSummary = sequelize.define(
    'MonsantoRetailerOrderImpactSummary',
    {
      productId: INTEGER,
      totalOrderedProductQuantityValue: INTEGER,
      totalOrderedProductQuantityMeasureCode: STRING,
      totalBookingDemandQuantityValue: INTEGER,
      totalBookingDemandQuantityMeasureCode: STRING,
      totalLongShortValue: INTEGER,
      totalLongShortMeasureCode: STRING,
      longShortType: ENUM('Short', 'Long', 'Zero'),

      increaseDecreaseProductQuantityChangeValue: INTEGER, // are this neccesary?
      increaseDecreaseProductQuantityMeasureCode: STRING, //
      increaseOrDecreaseType: STRING, //
    },
    {},
  );
  MonsantoRetailerOrderImpactSummary.associate = (models) => {};

  return MonsantoRetailerOrderImpactSummary;
};

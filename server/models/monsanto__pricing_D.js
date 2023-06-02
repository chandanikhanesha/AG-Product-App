'use strict';
module.exports = (sequelize, { DECIMAL, STRING, INTEGER }) => {
  const MonsantoPricing = sequelize.define(
    'MonsantoPricing',
    {
      type: STRING,
      monetaryValue: DECIMAL,
      currencyCode: STRING,
      measurementValue: INTEGER,
      unitOfMeasureCode: STRING,
    },
    {},
  );
  MonsantoPricing.associate = () => {};

  return MonsantoPricing;
};

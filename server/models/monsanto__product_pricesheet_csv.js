'use strict';
module.exports = (sequelize, { ARRAY, STRING, DECIMAL, INTEGER, DATE, JSON }) => {
  const CsvPricesheetProduct = sequelize.define(
    'CsvPricesheetProduct',
    {
      zoneId: ARRAY(STRING),
      lineNumber: INTEGER,
      // productId: {
      //   type: INTEGER,
      //   allowNull: false,
      //   references: {
      //     model: 'MonsantoProducts',
      //     key: 'id',
      //   },
      // },
      crossReferenceProductId: {
        type: STRING,
      },
      organizationId: INTEGER,
      effectiveFrom: DATE,
      effectiveTo: DATE,
      treatment: STRING,
      suggestedDealerPrice: JSON,
      suggestedDealerCurrencyCode: JSON,
      suggestedDealerMeasurementValue: INTEGER,
      suggestedDealerMeasurementUnitCode: JSON,

      suggestedEndUserPrice: JSON,
      suggestedEndUserCurrencyCode: INTEGER,
      suggestedEndUserMeasurementValue: INTEGER,
      suggestedEndUserMeasurementUnitCode: INTEGER,
      cropType: STRING,
    },
    {},
  );
  CsvPricesheetProduct.associate = (models) => {
    // models.CsvPricesheetProduct.belongsTo(models.MonsantoProduct, {
    //   as: 'Product',
    // });
  };

  return CsvPricesheetProduct;
};

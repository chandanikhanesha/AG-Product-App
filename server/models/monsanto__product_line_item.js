'use strict';
module.exports = (sequelize, { ARRAY, STRING, DECIMAL, INTEGER, DATE, JSON }) => {
  const MonsantoProductLineItem = sequelize.define(
    'MonsantoProductLineItem',
    {
      zoneId: ARRAY(STRING),
      lineNumber: INTEGER,
      productId: {
        type: INTEGER,
        allowNull: false,
        references: {
          model: 'MonsantoProducts',
          key: 'id',
        },
      },
      crossReferenceProductId: {
        type: STRING,
      },
      organizationId: INTEGER,
      effectiveFrom: DATE,
      effectiveTo: DATE,

      suggestedDealerPrice: JSON,
      suggestedDealerCurrencyCode: JSON,
      suggestedDealerMeasurementValue: INTEGER,
      suggestedDealerMeasurementUnitCode: JSON,

      suggestedEndUserPrice: JSON,
      suggestedEndUserCurrencyCode: INTEGER,
      suggestedEndUserMeasurementValue: INTEGER,
      suggestedEndUserMeasurementUnitCode: INTEGER,
      cropType: STRING,
      upcCode: {
        type: STRING,
      },
    },
    {},
  );
  MonsantoProductLineItem.associate = (models) => {
    models.MonsantoProductLineItem.belongsTo(models.MonsantoProduct, {
      as: 'Product',
      foreignKey: 'productId',
    });
  };

  return MonsantoProductLineItem;
};

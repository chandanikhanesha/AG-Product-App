'use strict';
module.exports = (sequelize, { STRING, INTEGER, DATE, TEXT, BOOLEAN }) => {
  const MonsantoProductBookingLineItem = sequelize.define(
    'MonsantoProductBookingLineItem',
    {
      lineNumber: STRING,
      orderLineItemNumber: STRING,
      increaseOrDecreaseType: STRING,
      quantityChangeValue: INTEGER,
      quantityChangeUnit: STRING,
      quantityValue: INTEGER,
      quantityUnit: STRING,
      requestedShipDateTime: DATE,
      potentialShipDateTime: DATE,
      specialInstructions: TEXT,
      productId: {
        type: INTEGER,
        allowNull: false,
        references: {
          model: 'MonsantoProducts',
          key: 'id',
        },
      },
      isDraft: BOOLEAN,
    },
    {},
  );
  MonsantoProductBookingLineItem.associate = (models) => {
    models.MonsantoProductBookingLineItem.belongsTo(models.MonsantoProduct, {
      as: 'Product',
      foreignKey: 'productId',
    });
  };

  return MonsantoProductBookingLineItem;
};

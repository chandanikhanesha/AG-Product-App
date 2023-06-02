'use strict';
module.exports = (sequelize, { ENUM, STRING, INTEGER, DECIMAL }) => {
  const MonsantoRetailerOrderSummaryProduct = sequelize.define(
    'MonsantoRetailerOrderSummaryProduct',
    {
      productId: {
        // productIdentification
        type: STRING,
        allowNull: false,
        references: {
          model: 'MonsantoProducts',
          key: 'crossReferenceId',
        },
        unique: 'summary_composite_unique',
      },

      summaryId: {
        type: INTEGER,
        allowNull: false,
        references: {
          model: 'MonsantoRetailerOrderSummaries',
          key: 'id',
        },
        unique: 'summary_composite_unique',
      },

      lineNumber: STRING,
      totalRetailerProductQuantityValue: DECIMAL,
      totalRetailerProductQuantityCode: STRING,

      shippedQuantityValue: DECIMAL,
      shippedQuantityCode: STRING,

      scheduledToShipQuantityValue: DECIMAL,
      scheduledToShipQuantityCode: STRING,

      balanceToShipQuantityValue: DECIMAL,
      balanceToShipQuantityCode: STRING,

      positionQuantityValue: DECIMAL,
      positionQuantityCode: STRING,
      positionQuantityStatus: ENUM('Short', 'Long', 'Zero'),

      transfersInQuantityValue: DECIMAL,
      transfersInQuantityCode: STRING,

      transfersOutQuantityValue: DECIMAL,
      transfersOutQuantityCode: STRING,

      returnsQuantityValue: DECIMAL,
      returnsQuantityCode: STRING,
      supply: {
        type: INTEGER,
      },
    },
    {},
  );

  MonsantoRetailerOrderSummaryProduct.associate = (models) => {
    MonsantoRetailerOrderSummaryProduct.belongsTo(models.MonsantoProduct, {
      as: 'Product',
      targetKey: 'id',
      foreignKey: 'productId',
    });
    MonsantoRetailerOrderSummaryProduct.belongsTo(models.MonsantoRetailerOrderSummary, {
      as: 'Summary',
      foreignKey: 'summaryId',
    });
  };

  return MonsantoRetailerOrderSummaryProduct;
};

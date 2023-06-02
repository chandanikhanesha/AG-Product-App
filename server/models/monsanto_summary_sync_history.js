'use strict';
module.exports = (sequelize, { ENUM, STRING, INTEGER, DECIMAL, BOOLEAN }) => {
  const MonsantoSummarySyncHistory = sequelize.define(
    'MonsantoSummarySyncHistory',
    {
      productId: {
        type: STRING,
        allowNull: false,
        references: {
          model: 'MonsantoProducts',
          key: 'id',
        },
        unique: 'summary_composite_unique',
      },
      syncId: {
        type: INTEGER,
      },

      bayerDealerBucketQtyBefore: {
        type: INTEGER,
      },
      allGrowerQtyBefore: {
        type: INTEGER,
      },
      supplyBefore: {
        type: INTEGER,
      },
      allGrowerQty: {
        type: INTEGER,
      },
      bayerDealerBucketQty: {
        type: INTEGER,
      },
      supply: {
        type: INTEGER,
      },

      organizationId: INTEGER,
    },
    {},
  );

  MonsantoSummarySyncHistory.associate = (models) => {
    MonsantoSummarySyncHistory.belongsTo(models.MonsantoProduct, {
      as: 'Product',
      targetKey: 'id',
      foreignKey: 'productId',
    });
  };

  return MonsantoSummarySyncHistory;
};

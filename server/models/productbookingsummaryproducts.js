'use strict';
module.exports = (sequelize, { ENUM, STRING, INTEGER, DECIMAL, BOOLEAN }) => {
  const MonsantoProductBookingSummaryProducts = sequelize.define(
    'MonsantoProductBookingSummaryProducts',
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

      bayerDealerBucketQty: {
        type: INTEGER,
      },
      allGrowerQty: {
        type: INTEGER,
      },
      isChanged: {
        type: BOOLEAN,
      },
      organizationId: INTEGER,
      crossReferenceId: STRING,
    },
    {},
  );

  MonsantoProductBookingSummaryProducts.associate = (models) => {
    MonsantoProductBookingSummaryProducts.belongsTo(models.MonsantoProduct, {
      as: 'Product',
      targetKey: 'id',
      foreignKey: 'productId',
    });
  };

  return MonsantoProductBookingSummaryProducts;
};

'use strict';
module.exports = (sequelize, { ARRAY, INTEGER, STRING, DATE, TEXT, ENUM, BOOLEAN }) => {
  const MonsantoPriceSheet = sequelize.define(
    'MonsantoPriceSheet',
    {
      identifier: STRING,
      buyerMonsantoId: STRING,
      sellerMonsantoId: STRING,
      zoneId: STRING,
      cropType: STRING,
      isSyncing: BOOLEAN,
      lastUpdateDate: JSON,
      startRequestTimestamp: JSON,
      endRequestTimestamp: JSON,
      //TODO: convert this reference in to proper association
    },
    {},
  );
  MonsantoPriceSheet.associate = () => {
    //MonsantoProduct.hasMany(models.Lot, { as: "lots" });
    //MonsantoProduct.BelongsTo(models.SeedCompany)
  };

  MonsantoPriceSheet.getSyncStatus = ({ buyerMonsantoId }) => {
    return MonsantoPriceSheet.findOne({
      attributes: ['isSyncing'],
      where: { buyerMonsantoId },
    });
  };

  MonsantoPriceSheet.setSyncStatus = ({ buyerMonsantoId, syncStatus }) => {
    return MonsantoPriceSheet.update({ syncStatus }, { where: { buyerMonsantoId } });
  };

  return MonsantoPriceSheet;
};

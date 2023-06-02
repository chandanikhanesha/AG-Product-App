'use strict';
module.exports = (sequelize, { ENUM, STRING, INTEGER }) => {
  const MonsantoPartner = sequelize.define(
    'MonsantoPartner',
    {
      agency: ENUM(
        'AGIIS-EBID',
        'GLN',
        'AGIIS-NAPD',
        'AssignedByBuyer',
        'AssignedBySeller',
        'AssignedByPapiNet',
        'AssignedByTestingLaboratory',
        'D-U-N-S',
        'EAN',
        'Other',
        'SCAC',
      ),
      name: STRING,
      identifier: STRING,
      seedYear: INTEGER,
      dataSource: STRING,
      softwareName: STRING,
      softwareVersion: STRING,
      addressLine: STRING,
      cityName: STRING,
      stateOrProvince: STRING,
      postalCode: STRING,
      postalCountry: STRING,
      role: STRING,
    },
    {},
  );
  MonsantoPartner.associate = () => {
    //MonsantoProduct.hasMany(models.Lot, { as: "lots" });
    //MonsantoProduct.BelongsTo(models.SeedCompany)
  };

  return MonsantoPartner;
};

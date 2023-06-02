'use strict';
module.exports = (sequelize, DataTypes) => {
  var Report = sequelize.define(
    'Report',
    {
      dealerDiscountIds: DataTypes.ARRAY(DataTypes.INTEGER),
      organizationId: DataTypes.INTEGER,
    },
    {},
  );
  Report.associate = function (models) {
    // associations can be defined here
  };
  return Report;
};

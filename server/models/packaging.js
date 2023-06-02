'use strict';
module.exports = (sequelize, DataTypes) => {
  var Packaging = sequelize.define(
    'Packaging',
    {
      organizationId: DataTypes.INTEGER,
      seedCompanyId: DataTypes.INTEGER,
      seedType: DataTypes.STRING,
      name: DataTypes.STRING,
      numberOfBags: DataTypes.DECIMAL(10, 1),
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  Packaging.associate = function (models) {
    // associations can be defined here
  };

  Packaging.softDestroy = (whereQuery) => {
    return Packaging.update({ isDeleted: true }, { where: whereQuery });
  };

  return Packaging;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  var SeedSize = sequelize.define(
    'SeedSize',
    {
      organizationId: DataTypes.INTEGER,
      seedCompanyId: DataTypes.INTEGER,
      seedType: DataTypes.STRING,
      name: DataTypes.STRING,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  SeedSize.associate = function (models) {
    // associations can be defined here
    SeedSize.belongsTo(models.SeedCompany, { foreignKey: 'seedCompanyId' });
  };

  SeedSize.softDestroy = (seedCompanyId) => {
    return SeedSize.update({ isDeleted: true }, { where: { seedCompanyId } });
  };

  return SeedSize;
};

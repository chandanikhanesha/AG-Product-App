'use strict';
module.exports = (sequelize, DataTypes) => {
  const Season = sequelize.define(
    'Season',
    {
      name: DataTypes.STRING,
      organizationId: DataTypes.INTEGER, //do not make a FK because default will be null
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
      seedCompanyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      companyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      apiCompanyIds: DataTypes.ARRAY(DataTypes.INTEGER),
    },
    {},
  );
  Season.associate = function (models) {
    models.Season.hasMany(models.Product, { foreignKey: 'seasonId' });
  };

  Season.prototype.softDestroy = (seasonId) => {
    return sequelize.models.Organization.update(
      { defaultSeason: null },
      {
        where: {
          defaultSeason: seasonId,
        },
        omitNull: false,
      },
    );
  };
  return Season;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  var StatementSetting = sequelize.define(
    'StatementSetting',
    {
      period: DataTypes.STRING,
      compoundingDays: DataTypes.INTEGER,
      organizationId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  StatementSetting.associate = function (models) {
    // associations can be defined here
  };

  StatementSetting.softDestroy = (whereQuery) => {
    return StatementSetting.update({ isDeleted: true }, { where: whereQuery });
  };

  return StatementSetting;
};

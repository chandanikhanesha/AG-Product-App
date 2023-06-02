'use strict';
module.exports = (sequelize, DataTypes) => {
  var SuperAdminSetting = sequelize.define(
    'SuperAdminSetting',
    {
      message: DataTypes.STRING,
      isSelected: DataTypes.BOOLEAN,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  SuperAdminSetting.associate = function (models) {
    // associations can be defined here
    // SuperAdminSetting.belongsTo(models.Customer);
  };
  return SuperAdminSetting;
};

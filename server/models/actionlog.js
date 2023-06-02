'use strict';
module.exports = (sequelize, DataTypes) => {
  var ActionLog = sequelize.define(
    'ActionLog',
    {
      organizationId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      typeId: DataTypes.INTEGER,
      user: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      operation: DataTypes.STRING,
      operationTime: DataTypes.DATE,
      previousData: DataTypes.JSON,
      changedData: DataTypes.JSON,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  ActionLog.associate = function (models) {
    // associations can be defined here
  };

  ActionLog.softDestroy = (whereQuery) => {
    return ActionLog.update({ isDeleted: true }, { where: whereQuery });
  };

  return ActionLog;
};

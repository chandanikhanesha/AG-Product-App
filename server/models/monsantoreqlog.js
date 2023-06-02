'use strict';
module.exports = (sequelize, DataTypes) => {
  var MonsantoReqLog = sequelize.define(
    'MonsantoReqLog',
    {
      organizationId: DataTypes.INTEGER,
      type: DataTypes.STRING,
      uuid: DataTypes.STRING,
      userName: DataTypes.STRING,
      description: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );

  MonsantoReqLog.associate = function (models) {
    // associations can be defined here
  };

  MonsantoReqLog.softDestroy = (whereQuery) => {
    return MonsantoReqLog.update({ isDeleted: true }, { where: whereQuery });
  };

  return MonsantoReqLog;
};

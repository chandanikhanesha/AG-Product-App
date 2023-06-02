'use strict';
module.exports = (sequelize, DataTypes) => {
  const BannerTextMsg = sequelize.define(
    'BannerTextMsg',
    {
      bannerText: DataTypes.STRING,
      isShowMsg: DataTypes.BOOLEAN,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {},
  );
  BannerTextMsg.associate = function (models) {
    // associations can be defined here
  };
  return BannerTextMsg;
};

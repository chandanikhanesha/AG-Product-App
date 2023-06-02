'use strict';
module.exports = (sequelize, DataTypes) => {
  var BannerMsg = sequelize.define(
    'BannerMsg',
    {
      organizationId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      userName: DataTypes.STRING,
      showBanner: DataTypes.BOOLEAN,
      bannerMsg: DataTypes.STRING,
      showBannerFlagDate: DataTypes.DATE,
      bannerStartDate: DataTypes.DATE,
      bannerEndDate: DataTypes.DATE,
    },
    {},
  );
  BannerMsg.associate = function (models) {
    // associations can be defined here
  };
  return BannerMsg;
};

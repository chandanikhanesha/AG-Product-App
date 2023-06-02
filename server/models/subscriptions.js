'use strict';
module.exports = (sequelize, DataTypes) => {
  var Subscriptions = sequelize.define(
    'Subscriptions',
    {
      planNames: DataTypes.STRING,
      organizationId: DataTypes.INTEGER,
      paymentMode: DataTypes.STRING,
      subscription_end_timestamp: DataTypes.DATE,
      subscription_start_timestamp: DataTypes.DATE,
    },
    {},
  );
  Subscriptions.associate = function (models) {
    Subscriptions.belongsTo(models.Organization);
    // associations can be defined here
  };
  return Subscriptions;
};

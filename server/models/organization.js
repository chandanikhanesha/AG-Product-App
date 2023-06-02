'use strict';

module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    'Organization',
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      email: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      logo: DataTypes.STRING,
      daysToInvoiceDueDateDefault: DataTypes.INTEGER,
      hiddenLots: DataTypes.JSON,
      defaultSeason: DataTypes.INTEGER,
      officePhoneNumber: DataTypes.STRING,
      businessStreet: DataTypes.STRING,
      businessCity: DataTypes.STRING,
      businessState: DataTypes.STRING,
      businessZip: DataTypes.STRING,
      subscriptionID: DataTypes.INTEGER,
      stripCustomerId: DataTypes.STRING,
      message: DataTypes.STRING,
    },
    {},
  );

  Organization.associate = function (models) {
    // associations can be defined here
    Organization.hasMany(models.User, { foreignKey: 'organizationId' });
  };

  return Organization;
};

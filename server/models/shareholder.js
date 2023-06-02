'use strict';
module.exports = (sequelize, DataTypes) => {
  var Shareholder = sequelize.define(
    'Shareholder',
    {
      customerId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      businessStreet: DataTypes.STRING,
      businessCity: DataTypes.STRING,
      businessState: DataTypes.STRING,
      businessZip: DataTypes.STRING,
    },
    {},
  );
  Shareholder.associate = function (models) {
    // associations can be defined here
    Shareholder.belongsTo(models.Customer, { foreignKey: 'customerId' });
  };
  return Shareholder;
};

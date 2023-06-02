'use strict';
module.exports = (sequelize, DataTypes) => {
  var Farm = sequelize.define(
    'Farm',
    {
      customerId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      shareholderData: DataTypes.JSON,
    },
    {},
  );
  Farm.associate = function (models) {
    // associations can be defined here
    Farm.belongsTo(models.Customer, { foreignKey: 'customerId' });
  };
  return Farm;
};

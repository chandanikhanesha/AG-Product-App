'use strict';
module.exports = (sequelize, DataTypes) => {
  var Customer = sequelize.define(
    'Customer',
    {
      organizationId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      organizationName: DataTypes.STRING,
      email: DataTypes.STRING,
      officePhoneNumber: DataTypes.STRING,
      cellPhoneNumber: DataTypes.STRING,
      deliveryAddress: DataTypes.STRING,
      businessStreet: DataTypes.STRING,
      businessCity: DataTypes.STRING,
      businessState: DataTypes.STRING,
      businessZip: DataTypes.STRING,
      monsantoTechnologyId: {
        type: DataTypes.STRING,
        unique: true,
      },
      isArchive: DataTypes.BOOLEAN,
      zoneIds: DataTypes.JSON,
      //GLN field
      glnId: DataTypes.STRING,
      isDeleted: DataTypes.BOOLEAN,
      notes: DataTypes.TEXT,
      addNotesDate: DataTypes.DATE,
      isDefferedProduct: DataTypes.BOOLEAN,
    },
    {},
  );
  Customer.associate = function (models) {
    Customer.hasMany(models.PurchaseOrder, { foreignKey: 'customerId' });
    Customer.hasMany(models.Shareholder, { foreignKey: 'customerId' });
    Customer.hasMany(models.Farm, { foreignKey: 'customerId' });
    Customer.hasMany(models.Statement, { foreignKey: 'customerId' });
    Customer.hasMany(models.Note, { foreignKey: 'customerId' });
  };
  return Customer;
};

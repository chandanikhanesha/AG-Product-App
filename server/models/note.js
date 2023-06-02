'use strict';
module.exports = (sequelize, DataTypes) => {
  var Note = sequelize.define(
    'Note',
    {
      organizationId: DataTypes.INTEGER,
      note: DataTypes.TEXT,
      relatedType: DataTypes.STRING,
      customerId: DataTypes.INTEGER,
      purchaseOrderId: DataTypes.INTEGER,
      reminderDate: DataTypes.DATE,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );

  Note.associate = function (models) {
    Note.belongsTo(models.PurchaseOrder, { foreignKey: 'purchaseOrderId' });
    Note.belongsTo(models.Customer, { foreignKey: 'customerId' });
  };

  Note.softDestroy = (whereQuery) => {
    return Note.update({ isDeleted: true }, { where: whereQuery });
  };

  return Note;
};

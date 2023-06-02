'use strict';
module.exports = (sequelize, DataTypes) => {
  var Statement = sequelize.define(
    'Statement',
    {
      statementNo: DataTypes.STRING,
      compoundingDays: DataTypes.INTEGER,
      startDate: DataTypes.DATE,
      purchaseOrderStatementStatementId: DataTypes.INTEGER,
      organizationId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
      customerId: DataTypes.INTEGER,
    },
    {},
  );
  Statement.associate = function (models) {
    // associations can be defined here
    Statement.belongsTo(models.Customer, { foreignKey: 'customerId' });
    Statement.belongsToMany(models.PurchaseOrder, {
      through: 'PurchaseOrderStatements',
      // as:'purchaseOrders',
      foreignKey: 'statementNo',
      // otherKey:'statementId'
    });
  };

  Statement.softDestroy = (whereQuery) => {
    return Statement.update({ isDeleted: true }, { where: whereQuery });
  };

  return Statement;
};

'use strict';
module.exports = (sequelize, DataTypes) => {
  var FinanceMethod = sequelize.define(
    'FinanceMethod',
    {
      name: DataTypes.STRING,
      seedCompanyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      companyIds: DataTypes.ARRAY(DataTypes.INTEGER),
      interestMethod: DataTypes.STRING,
      interestRate: DataTypes.INTEGER,
      organizationId: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  FinanceMethod.associate = function (models) {
    // associations can be defined here
  };

  FinanceMethod.softDestroy = (whereQuery) => {
    return FinanceMethod.update({ isDeleted: true }, { where: whereQuery });
  };

  return FinanceMethod;
};

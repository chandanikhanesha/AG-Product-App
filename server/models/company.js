'use strict';
module.exports = (sequelize, DataTypes) => {
  var Company = sequelize.define(
    'Company',
    {
      organizationId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      isDeleted: DataTypes.BOOLEAN,
    },
    {},
  );
  Company.associate = function (models) {
    Company.hasMany(models.CustomProduct, { foreignKey: 'companyId' });
    // Company.belongsTo(models.Organization, { foreignKey: 'organizationId' });
  };

  Company.prototype.softDestroy = (companyId) => {
    return new Promise((resolve, reject) => {
      return Promise.all([sequelize.models.CustomProduct.softDestroy({ companyId })])
        .then(() => resolve())
        .catch((e) => reject(e));
    });
  };

  return Company;
};

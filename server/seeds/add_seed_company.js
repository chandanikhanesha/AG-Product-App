const { Product, SeedCompany } = require('models');

module.exports = async () => {
  return SeedCompany.create({
    organizationId: 1,
    name: 'Monsanto',
    cornBrandName: 'Corn',
    sorghumBrandName: 'Sorghum',
    soybeanBrandName: 'Soybean',
    alfalfaBrandName: 'Alfalfa',
    canolaBrandName: 'Canola',
  }).then((seedCompany) => Product.update({ seedCompanyId: seedCompany.id }, { where: {} }));
};

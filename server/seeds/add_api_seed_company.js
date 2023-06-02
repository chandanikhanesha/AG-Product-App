const { ApiSeedCompany } = require('models');

module.exports = async () =>
  ApiSeedCompany.create({
    organizationId: 1,
    name: 'Monsanto',
    cornBrandName: 'Corn',
    sorghumBrandName: 'Sorghum',
    soybeanBrandName: 'Soybean',
    alfalfaBrandName: 'Alfalfa',
    canolaBrandName: 'Canola',
  });
// .then(seedCompany => MonProduct.update({ seedCompanyId: seedCompany.id }, { where: {} }))

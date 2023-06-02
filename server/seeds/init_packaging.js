const { Product, Packaging } = require('models');

module.exports = async () => {
  console.log('\nseeding packaging\n');

  // return Product.all({where: {seedType: 'SORGHUM'}})
  // .then(sorghum => {
  //   return Promise.all(
  //     sorghum.map(p => {
  //       let amt = p.seedSize
  //       p.amountPerBag = amt
  //       p.seedSize = null
  //       return p.save()
  //     })
  //   )
  // })
  // .then(() => {
  return Promise.all(
    [
      { name: '80M', numberOfBags: 1, organizationId: 1 },
      { name: 'SP50', numberOfBags: 50, organizationId: 1 },
      { name: 'SP45', numberOfBags: 45, organizationId: 1 },
      { name: 'SP40', numberOfBags: 40, organizationId: 1 },
      { name: '40SCU_MB', numberOfBags: 40, organizationId: 1 },
      { name: '50#', numberOfBags: 1, organizationId: 1 },
    ].map((packageSeed) => {
      return Packaging.create(packageSeed).then((packaging) => {
        return Product.update({ packagingId: packaging.id }, { where: { amountPerBag: packageSeed.name } });
      });
    }),
  );
  // })
};

const { Product, ProductPackaging } = require('./models');

const KUNERTH_ORG_ID = 7;
let productIds = [];

Product.all({
  where: {
    organizationId: KUNERTH_ORG_ID,
    seedType: 'SOYBEAN',
  },
}).then((products) => {
  productIds = products.map((p) => p.id);
  ProductPackaging.all({
    where: {
      organizationId: KUNERTH_ORG_ID,
    },
  }).then((productPackagings) => {
    productPackagings.forEach((productPackaging) => {
      if (!productIds.includes(productPackaging.productId)) return;
      if (!productPackaging.packagingGroups.length) return;

      let newGroups = [];

      productPackaging.packagingGroups.forEach((group) => {
        if (!group.seedSizeId) {
          let newGroup = Object.assign({}, group);
          newGroup.seedSizeId = 43;
          newGroups.push(newGroup);
        } else {
          newGroups.push(group);
        }
      });

      productPackaging.update({
        packagingGroups: newGroups,
      });
    });
  });

  console.log('done');
});

/*
 * Insert grower orders from json file
 */

const { Lot, Product } = require('models');

module.exports = async () => {
  console.log('\ngenerating lot numbers...\n');
  let lots = [];

  return Product.all().then((products) => {
    products.forEach((product) => {
      let total = product.quantity;
      while (total > 0) {
        let lot = {};
        lot.productId = product.id;
        lot.organizationId = product.organizationId || 1;
        lot.lotNumber =
          Math.ceil(Math.random() * 9).toString() +
          Math.ceil(Math.random() * 9).toString() +
          Math.ceil(Math.random() * 9).toString() +
          Math.ceil(Math.random() * 9).toString();
        let lotQuantity = Math.ceil(Math.random() * total + 20);
        if (total - lotQuantity < 40) {
          lot.quantity = total;
          total = -1;
        } else {
          lot.quantity = lotQuantity;
          total = total - lotQuantity;
        }
        lots.push(lot);
      }
    });
    return Promise.all(lots.map((lot) => new Lot(lot).save()));
  });
};

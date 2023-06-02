/**
 * Returns a name (short descriptor) for a custom product
 * @param {Object} product Product from the database
 */
const getCustomProductName = (product) => {
  let name = product.name;
  console.log(name);
  if (product.type) name += ` / ${product.type}`;
  if (product.description) name += ` / ${product.description}`;
  return name;
};

/**
 * Return a name (short descriptor) for a product
 * @param {Object} product Product from the database
 * @param {Object[]} seedCompanies List of seed companies, used for seed type names
 */
const getProductName = (product, seedCompanies) => {
  if (!product.hasOwnProperty('seedType')) return getCustomProductName(product);

  let seedCompany = seedCompanies.find((sc) => sc.id === product.seedCompanyId);
  let name = '';
  if (seedCompany) {
    switch (product.seedType.toLowerCase()) {
      case 'soybean':
        name += seedCompany.soybeanBrandName || 'Soybean';
        break;
      case 'sorghum':
        name += seedCompany.sorghumBrandName || 'Sorghum';
        break;
      case 'corn':
        name += seedCompany.cornBrandName || 'Corn';
        break;
      default:
        break;
    }
  }

  if (product.blend) name += ` / ${product.blend}`;
  if (product.brand) name += ` / ${product.brand}`;
  if (product.treatment) name += ` / ${product.treatment}`;

  return name;
};

/**
 * Return the total ordered for a product, the sum of all lots `orderAmount`
 * @param {Object} product Product from he database, containing a `lots` attribute
 */
const getQtyOrdered = (product) => {
  if (product.lots == null) return 0;
  return product.lots.reduce((acc, lot) => {
    let amt = Number(lot.orderAmount, 10) || 0;
    if (lot.transfer === 'out') {
      amt = -Math.abs(amt);
    } else if (lot.transfer === 'in') {
      amt = Math.abs(amt);
    }
    return acc + amt;
  }, 0);
};

/**
 * Return the quantity shipped for a product
 * @param {Object} product Product from the database, containing a `lots` attribute
 */
const getQtyShipped = (product) => {
  if (product.lots == null) return 0;
  return product.lots.reduce((acc, lot) => {
    let amt = Number(lot.quantity, 10) || 0;
    if (lot.transfer === 'out') {
      amt = -Math.abs(amt);
    } else if (lot.transfer === 'in') {
      amt = Math.abs(amt);
    }
    return acc + amt;
  }, 0);
};

/**
 * Return the grower order amount for a product
 * @param {Object} product Product from the database
 * @param {Object[]} customerProducts Array of all customerProducts
 */
const getGrowerOrder = (product, customerProducts) => {
  return customerProducts
    .filter((order) => order.productId === product.id)
    .reduce((acc, order) => acc + Number(order.orderQty), 0);
};

/**
 * Returns the grower amount delivered for a product
 * @param {Object} product Product from the database
 * @param {Object[]} deliveryReceiptDetails Single (flattened) array of all delivery receipt details from all delivery receipts
 */
const getGrowerOrderDelivered = (product, deliveryReceiptDetails) => {
  let productLotIds = (product.lots || []).map((l) => l.id);
  return deliveryReceiptDetails
    .filter((detail) => productLotIds.includes(detail.lotId))
    .reduce((acc, detail) => acc + Number(detail.amountDelivered), 0);
};

/**
 * Returns a `Product` object from an order (CustomerProduct)
 * @param {Object} order An CustomerProduct from the database
 * @param {Object[]} products A list of products from the database
 * @param {Object[]} customProducts A list of custom products from the database, optional
 */
const getProductFromOrder = (order, products, customProducts) => {
  let _customProducts = customProducts || [];
  let _products = products || [];
  return [..._products, ..._customProducts].find((p) => {
    if (order.hasOwnProperty('productId')) return p.id === order.productId;
    return p.hasOwnProperty('name') && p.id === order.customProductId;
  });
};

module.exports = {
  getCustomProductName,
  getProductName,
  getQtyOrdered,
  getQtyShipped,
  getGrowerOrder,
  getGrowerOrderDelivered,
  getProductFromOrder,
};

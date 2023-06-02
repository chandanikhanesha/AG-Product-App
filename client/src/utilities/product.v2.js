/**
 * Returns a name (short descriptor) for a custom product
 * @param {Object} product Product from the database
 */
export const getCustomProductName = (product) => {
  let name = product.name;
  if (product.type) name += ` / ${product.type}`;
  if (product.description) name += ` / ${product.description}`;
  return name;
};

export const getProductSeedBrand = (product, seedCompanies) => {
  if (!product.hasOwnProperty('seedType')) return '';
  let seedCompany = product.SeedCompany;
  if (!seedCompany && seedCompanies) {
    seedCompany = seedCompanies.find((_seedCompany) => _seedCompany.id === product.seedCompanyId);
  }
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
      case 'canola':
        name += seedCompany.canolaBrandName || 'Canola';
        break;
      case 'alfalfa':
        name += seedCompany.alfalfaBrandName || 'Alfalfa';
        break;
      default:
        break;
    }
  }
  return name;
};

/**
 * Return a name (short descriptor) for a product
 * @param {Object} product Product from the database
 * @param {Object[]} seedCompanies List of seed companies, used for seed type names
 */
export const getProductName = (product) => {
  if (!product.hasOwnProperty('seedType')) return getCustomProductName(product);
  let name = '';
  if (product.SeedCompany) name += `${product.SeedCompany.name}`;
  if (product.blend) name += `/ ${product.blend}`;
  if (product.brand) name += ` / ${product.brand}`;
  if (product.treatment) name += ` / ${product.treatment}`;

  return name;
};

/**
 * Return the total ordered for a product, the sum of all lots `orderAmount`
 * @param {Object} product Product from he database, containing a `lots` attribute
 */
export const getQtyOrdered = (product) => {
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
export const getQtyShipped = (product) => {
  return product.lots
    .filter((p) => p.isDeleted == false)
    .reduce((acc, lot) => {
      let amt = Number(lot.quantity, 10) || 0;
      if (lot.source === 'Transfer Out' || lot.source === 'Seed Dealer Transfer Out') {
        amt = -Math.abs(amt);
      } else if (lot.source === 'Transfer In' || lot.source === 'Seed Dealer Transfer In') {
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
export const getGrowerOrder = (product, customerProducts) => {
  return customerProducts
    .filter((order) => order.productId === product.id)
    .reduce((acc, order) => acc + Number(order.orderQty));
};

/**
 * Returns the grower amount delivered for a product
 * @param {Object} product Product from the database
 * @param {Object[]} deliveryReceiptDetails Single (flattened) array of all delivery receipt details from all delivery receipts
 */
export const getGrowerOrderDelivered = (product, deliveryReceiptDetails) => {
  let productLotIds = (product.lots || []).filter((l) => l.isDeleted == false).map((l) => l.id);
  return deliveryReceiptDetails
    .filter((detail) => productLotIds.includes(detail.lotId))
    .reduce((acc, detail) => acc + Number(detail.amountDelivered));
};

/**
 * Returns a `Product` object from an order (CustomerProduct)
 * @param {Object} order An CustomerProduct from the database
 * @param {Object[]} products A list of products from the database
 * @param {Object[]} customProducts A list of custom products from the database, optional
 */
export const getProductFromOrder = (order, products, customProducts) => {
  let _customProducts = customProducts || [];
  let _products = products || [];
  return [..._products, ..._customProducts].find((p) => {
    if (order.hasOwnProperty('productId')) return p.id === order.productId;
    return p.hasOwnProperty('name') && p.id === order.customProductId;
  });
};

export const groupCustomerOrdersByProduct = (customerOrdersDetails) => {
  const productGroups = {};
  customerOrdersDetails.forEach((data) => {
    if (!data.product) return;
    if (!productGroups[data.product.id]) {
      return (productGroups[data.product.id] = {
        product: data.product,
        customerOrders: [data.customerOrder],
      });
    }
    productGroups[data.product.id].customerOrders.push(data.customerOrder);
  });
  return productGroups;
};

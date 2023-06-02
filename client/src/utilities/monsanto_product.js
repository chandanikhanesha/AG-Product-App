/**
 * Return the total ordered for a product, the sum of all lots `orderAmount`
 * @param {Object} product Product from he database, containing a `lots` attribute
 * @param {Object[]} monsantoProducts Array of all monsantoProducts
 */
export const getMonsantoQty = (product, monsantoProducts) => {
  const monsantoProduct = monsantoProducts.find(
    (_monsantoProduct) =>
      _monsantoProduct.id === product.id && _monsantoProduct.seedCompanyId === product.seedCompanyId,
  );
  return monsantoProduct ? monsantoProduct.quantity : 0; //monsantoProducts.find(monsantoProduct => monsantoProduct.)
};

/**
 * Return the grower order amount for a product
 * @param {Object} product Product from the database
 * @param {Object[]} monsantoRetailerProducts Array of all monsantoRetailerProducts
 */
export const getMonsantoGrowerOrder = (product, monsantoRetailerProducts) => {
  const monsantoRetailerProduct = monsantoRetailerProducts.find(
    (monsantoRetailerProduct) => monsantoRetailerProduct.id === product.id,
  );
  return monsantoRetailerProduct ? parseInt(monsantoRetailerProduct.retailerOrderQty, 10) : 0;
};

/**
 * Return the grower order amount for a product
 * @param {Object} product Product from the database
 * @param {Object[]} monsantoRetailerProducts Array of all monsantoRetailerProducts
 */
export const getMonsantoProductLongShort = (product, customerMonsantoProducts) => {
  let value = 0;
  customerMonsantoProducts.map((customerMonsantoProduct) => {
    if (product.Product.id === customerMonsantoProduct.monsantoProductId) {
      value =
        parseInt(customerMonsantoProduct.monsantoOrderQty ? customerMonsantoProduct.monsantoOrderQty : 0, 10) -
        parseInt(customerMonsantoProduct.orderQty ? customerMonsantoProduct.orderQty : 0, 10);
    }
  });
  return value;
};

export const transferWay = 'toGrower' | 'toHolding' | 'toMonsanto';
export const transferWays = [
  { id: 'toGrower', value: 'To Other Grower' },
  { id: 'toHolding', value: 'Bayer Dealer Bucket' },
  { id: 'toMonsanto', value: 'Back to Monsanto' },
];

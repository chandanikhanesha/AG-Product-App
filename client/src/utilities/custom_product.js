/**
 * Return the grower order amount for a custom product
 * @param {Object} product Custom product from the database
 * @param {Object[]} customerCustomProducts Array of all customerCustomProducts
 */
export const getGrowerCustomOrder = (product, customerCustomProducts) => {
  return customerCustomProducts
    .filter((order) => order.customProductId === product.id)
    .reduce((acc, order) => acc + order.orderQty, 0);
};

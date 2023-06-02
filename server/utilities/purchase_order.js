const { customerProductDiscountsTotals, numberToDollars } = require('utilities');
const { getProductFromOrder } = require('utilities/product');

/**
 * Return an object where the keys are dates, and the values are arrays
 * of `customerProductDiscountTotals` (function from utilities0)
 * @param {Object[]} customerOrders Array of orders, `CustomerProduct` database items
 * @param {Object=} shareholder Optional `Shareholder` object from the database. If passed, the calculated discounts will be based on the shareholders share.
 * @param {Object[]} dealerDiscounts Array of dealer discounts
 * @param {Object} purchaseOrder The purchase order
 * @param {Object[]} products An array of products
 * @param {Object[]} customProducts An array of custom products
 */
const getFutureDiscountTotals = ({
  customerOrders,
  shareholder,
  dealerDiscounts,
  purchaseOrder,
  products,
  customProducts,
}) => {
  let futureDiscountTotals = {};
  let earlyPayDiscounts = dealerDiscounts.filter((dd) => dd.discountStrategy === 'Early Pay Discount');
  if (!earlyPayDiscounts.length) return futureDiscountTotals;

  earlyPayDiscounts.forEach((earlyPayDiscount, earlyPayDiscountsIndex) => {
    earlyPayDiscount.detail.forEach((_, index) => {
      if (earlyPayDiscountsIndex === 0 && index === 0) return;

      if (new Date(earlyPayDiscount.detail[index].date) <= new Date()) return;
      if (!futureDiscountTotals[earlyPayDiscount.detail[index].date]) {
        futureDiscountTotals[earlyPayDiscount.detail[index].date] = [];
      }
      customerOrders.forEach((order) => {
        // order <-> customProduct
        const product = getProductFromOrder(order, products, customProducts);
        let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
        let customerProductDiscounts = customerProductDiscountsTotals(
          order,
          appliedDiscounts,
          product,
          earlyPayDiscount,
          index,
          shareholder,
          purchaseOrder,
        );
        if (customerProductDiscounts.originalPrice) {
          futureDiscountTotals[earlyPayDiscount.detail[index].date].push(customerProductDiscounts);
        }
      });
    });
  });

  return futureDiscountTotals;
};

/**
 * Return an Object of an order summary after applied discounts
 * @param {Array} discountTotals
 * @param {Array} dealerDiscounts , all discount applied for a dealer
 *  @param {Boolean} convertToDollar , convert final rows to dollar format

 */
const getOrderSummary = ({ discountTotals, dealerDiscounts, convertToDollar = true }) => {
  let totalDiscount = 0;

  let orderSummary = dealerDiscounts
    .filter((discount) => {
      return discountTotals.map((total) => Object.keys(total.discounts).includes(discount.id.toString()));
    })
    .map((discount) => {
      let total = 0;

      discountTotals.forEach((discountTotal) => {
        Object.keys(discountTotal.discounts).forEach((discountId) => {
          if (discountId === discount.id.toString()) {
            total += discountTotal.discounts[discountId].amount;
          }
        });
      });

      totalDiscount += total;
      return convertToDollar ? numberToDollars(total) : total;
    });

  let msrp = discountTotals.reduce((acc, total) => acc + total.originalPrice, 0);

  orderSummary.push(convertToDollar ? numberToDollars(totalDiscount) : totalDiscount);
  orderSummary.push(convertToDollar ? numberToDollars(msrp) : msrp);
  orderSummary.push(convertToDollar ? numberToDollars(msrp - totalDiscount) : msrp - totalDiscount);

  return orderSummary;
};

/**
 * Return an array of dealer discounts that are used for an order
 * @param {Object} order A `CustomerProduct` from the database
 */
const getAppliedDiscounts = (order, dealerDiscounts) => {
  return (order.discounts || [])
    .map((orderDiscount) => {
      return dealerDiscounts.find((dd) => dd.id === orderDiscount.DiscountId);
    })
    .filter((x) => x !== undefined);
};

const getOrderTotals = ({
  customerOrders = [],
  products = [],
  customProducts = [],
  dealerDiscounts = [],
  shareholder,
  purchaseOrder,
}) => {
  let orderTotals = [];
  customerOrders.forEach((order) => {
    const product = getProductFromOrder(order, products, customProducts);
    let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
    let customerProductDiscounts = customerProductDiscountsTotals(
      order,
      appliedDiscounts,
      product,
      null,
      null,
      shareholder,
      purchaseOrder,
    );
    orderTotals.push(customerProductDiscounts);
  });

  return orderTotals;
};

module.exports = {
  getFutureDiscountTotals,
  getOrderSummary,
  getAppliedDiscounts,
  getOrderTotals,
};

import { customerProductDiscountsTotals, numberToDollars } from './index';
import { getProductFromOrder } from './product';

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
export const getFutureDiscountTotals = ({
  customerOrders,
  shareholder,
  dealerDiscounts,
  purchaseOrder,
  products,
  customProducts,
}) => {
  let futureDiscountTotals = {};
  let usedDiscounts = customerOrders.reduce((acc, order) => {
    let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
    appliedDiscounts.forEach((discount) => {
      if (!acc.includes(discount)) acc.push(discount);
    });
    return acc;
  }, []);

  let futureDates = usedDiscounts
    .filter((d) => d.discountStrategy === 'Early Pay Discount')
    .reduce((acc, discount) => {
      let dates = discount.detail.map((detail) => detail.date);
      dates.forEach((date) => {
        if (!acc.includes(date)) acc.push(date);
      });
      return acc;
    }, [])
    .sort();

  let Futurevalue = usedDiscounts
    .filter((d) => d.discountStrategy === 'Early Pay Discount')
    .reduce((acc, discount) => {
      let dates = discount.detail.map((detail) => detail);
      dates.forEach((date) => {
        if (!acc.includes(date)) acc.push(date);
      });
      return acc;
    }, [])
    .sort();

  if (!futureDates.length) return futureDiscountTotals;
  var lastFutureDate = new Date(futureDates[futureDates.length - 1]);
  var tomorrow = new Date(lastFutureDate);
  tomorrow.setDate(lastFutureDate.getDate() + 1);
  // futureDates.push(tomorrow.toISOString().slice(0, 10));

  futureDates.push(new Date('July 31, 2023').toISOString().slice(0, 10));

  futureDates.forEach((futureDate, i) => {
    futureDiscountTotals[futureDate] = [];
    const value = Futurevalue.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    }).find((f) => f.date == futureDate);
    customerOrders
      .filter((d) =>
        d.isDeleted == false && d.hasOwnProperty('pickLaterProductId')
          ? d.pickLaterProductId == null
            ? true
            : false
          : true,
      )
      .forEach((order) => {
        const product = order.hasOwnProperty('monsantoProductId')
          ? order.MonsantoProduct
          : getProductFromOrder(order, products, customProducts);
        let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts, futureDate);
        const date = i == 0 ? order.orderDate : futureDate;
        let customerProductDiscounts = customerProductDiscountsTotals(
          order,
          appliedDiscounts,
          product,
          null,
          null,
          shareholder,
          purchaseOrder,
          null,
          date,
        );
        customerProductDiscounts['currentDisount'] = value;
        futureDiscountTotals[futureDate].push(customerProductDiscounts);
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
export const getOrderSummary = ({ discountTotals, dealerDiscounts, convertToDollar = true }) => {
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
export const getAppliedDiscounts = (order, dealerDiscounts, futureDate) => {
  if (!order.discounts || order.discounts.length < 1) return [];

  // console.log(dealerDiscounts, 'dealerDiscounts', order);
  return order.discounts
    .sort((a, b) => a.order - b.order)
    .map((orderDiscount) => {
      return dealerDiscounts.find((dd) => dd.id === orderDiscount.DiscountId);
    })
    .filter((x) => x !== undefined);
};

export const getOrderTotals = ({
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

/**
 * Return the most recent `lastUpdated` date from the array of `items`
 * @param {Array} items Any database list where each object contains a `lastUpdated` date
 */
const getLastUpdatedDate = (items) => {
  let last = items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || {};
  return last.updatedAt || null;
};

/**
 * Response for "list" requests.  Filters the items where `isDeleted` is false and returns the last update of all items for caching purposes
 * @param {Array} items Array of database objects that contain `lastUpdated` and `isDeleted` fields
 * @param {string} filterByInclude If passed, use this included association for `isDeleted` filter
 */
const filterDeletedListResponse = (items, filterByInclude) => {
  return {
    items: items.filter((item) =>
      filterByInclude !== undefined
        ? item[filterByInclude].isDeleted === false || item[filterByInclude].isDeleted === null
        : item.isDeleted === false || item.isDeleted === null,
    ),
    lastUpdate: getLastUpdatedDate(items),
  };
};

const setResultToArray = (results) => {
  return filterDeletedListResponse(results).items.map((item) => item.toJSON());
};

/**
 * Returns the customer product total
 * @param {Number} msrp Product msrp
 * @param {Number} quantity How many of product was ordered
 */
const total = (msrp, quantity) => {
  return (msrp || 0.0) * quantity;
};

/**
 * Returns whether a shareholder discount percentage should be applied, and the percentage
 * @param {Shareholder} shareholder
 * @param {PurchaseOrder} purchaseOrder
 * @param {CustomerProduct | CustomerCustomProduct} customerProduct
 */
const getShareholderPercentage = (shareholder, purchaseOrder, customerProduct) => {
  const applyShareholderPercentage = shareholder && purchaseOrder !== undefined;
  let shareholderPercentage = 0;
  if (!applyShareholderPercentage) return { applyShareholderPercentage, shareholderPercentage };

  let orderShareholderData = customerProduct.shareholderData.find((d) => d.shareholderId === shareholder.id);
  if (orderShareholderData) {
    shareholderPercentage = orderShareholderData.percentage;
  } else {
    let farmData = purchaseOrder.farmData.find((data) => data.farmId === customerProduct.farmId);
    if (farmData) {
      let shareholderData = farmData.shareholderData.find((data) => data.shareholderId === shareholder.id);
      if (shareholderData) {
        shareholderPercentage = shareholderData.percentage;
      } else {
        shareholderPercentage = 0;
      }
    } else {
      shareholderPercentage = 0;
    }
  }

  return { applyShareholderPercentage, shareholderPercentage };
};

const discountMatchesProductType = (dealerDiscount, product) => {
  if (product.seedType) {
    return dealerDiscount.productCategories.includes(product.seedType);
  } else {
    return dealerDiscount.companyIds.includes(product.companyId);
  }
};

const doesDiscountApply = (dealerDiscount, product, customerProduct) => {
  if (dealerDiscount.seedCompanyId && product.seedCompanyId && dealerDiscount.seedCompanyId !== product.seedCompanyId)
    return false;
  if (!dealerDiscount.detail) return false;
  let orderDate = new Date(customerProduct.orderDate || customerProduct.createdAt);
  if (isNaN(orderDate)) orderDate = new Date();
  if (dealerDiscount.lastDate && orderDate > new Date(dealerDiscount.lastDate)) return false;
  if (!discountMatchesProductType(dealerDiscount, product)) return false;
  return dealerDiscount.applyToWholeOrder !== true;
};

const doesDiscountDetailApply = (customerProduct, dealerDiscount, discountDetail, amt) => {
  let qty = customerProduct.orderQty;

  if (dealerDiscount.discountStrategy === 'Dollar Volume Discount') {
    return parseInt(discountDetail.minDollars, 10) <= amt && parseInt(discountDetail.maxDollars, 10) >= amt;
  }

  let orderDate = new Date(customerProduct.orderDate || customerProduct.createdAt) || new Date();

  return (
    // check if minQty applies
    (discountDetail['minQty'] ? parseInt(discountDetail['minQty'], 10) <= qty : true) &&
    // check if maxQty applies
    (discountDetail['maxQty'] ? parseInt(discountDetail['maxQty'], 10) >= qty : true) &&
    // check if detail Date applies
    (discountDetail.date ? orderDate < new Date(discountDetail.date) : true)
  );
};

const applyDiscounts = (
  data,
  msrp,
  dealerDiscounts,
  product,
  customerProduct,
  forceUseEarlyPayDiscount,
  forceUseEarlyPayDiscountDetailIndex,
  applyShareholderPercentage,
  shareholderPercentage,
) => {
  dealerDiscounts.forEach((dealerDiscount) => {
    if (!doesDiscountApply(dealerDiscount, product, customerProduct)) return;

    data.discounts[dealerDiscount.id] = {
      value: '',
      amount: 0,
      dealerDiscount,
      detailIndex: null,
    };
    let itterator = dealerDiscount.detail;
    // If we are using a forced early pay calculation, use the early discount detail that is in the future

    if (dealerDiscount.discountStrategy === 'Early Pay Discount' && forceUseEarlyPayDiscount) {
      if (dealerDiscount === forceUseEarlyPayDiscount && forceUseEarlyPayDiscountDetailIndex) {
        itterator = [forceUseEarlyPayDiscount.detail[forceUseEarlyPayDiscountDetailIndex]];
      } else {
        // pay By:  column date
        const futureDate = forceUseEarlyPayDiscount.detail[forceUseEarlyPayDiscountDetailIndex].date;

        //find closer detail applicable
        const closerDetail = dealerDiscount.detail.find((discount) => new Date(discount.date) >= new Date(futureDate));
        if (closerDetail) {
          itterator = [closerDetail];
        } else {
          return;
        }
      }
    }

    for (let i = 0; i < itterator.length; i++) {
      let discountDetail = itterator[i];
      if (!doesDiscountDetailApply(customerProduct, dealerDiscount, discountDetail, msrp)) continue;

      data.discounts[dealerDiscount.id].detailIndex = forceUseEarlyPayDiscountDetailIndex;

      let before = msrp;
      if (discountDetail.unit === '$') {
        let discount = parseInt(discountDetail.discountValue, 10);
        if (applyShareholderPercentage) discount = discount * (shareholderPercentage / 100);
        msrp = msrp - discount;
        data.discounts[dealerDiscount.id].amount = customerProduct.orderQty * (before - msrp);
        data.discounts[dealerDiscount.id].value = `$${discountDetail.discountValue}`;
      } else if (discountDetail.unit === '%') {
        msrp = msrp - msrp * (parseInt(discountDetail.discountValue, 10) / 100);
        data.discounts[dealerDiscount.id].amount = customerProduct.orderQty * (before - msrp);
        data.discounts[dealerDiscount.id].value = `${discountDetail.discountValue}%`;
      }

      // If this is an early pay discount only use the first detail that applies, not future discount details
      if (dealerDiscount.discountStrategy === 'Early Pay Discount') break;
    }
  });

  return msrp;
};

/**
 * Calculates the order total and discounts total for a cutomer order (CustomerProduct or CustomerCustomProduct).
 * @param {CustomerProduct | CustomerCustomProduct} customerProduct Single CustomerProduct or CustomerCustomProduct total calculations will be based on
 * @param {DealerDiscount[]} dealerDiscounts Array of all dealer discounts
 * @param {Product} product Product that goes with the customerProduct
 * @param {DealerDiscount} forceUseEarlyPayDiscount If we need to force this function to use a specfic Early Pay discount (used when calculating future discount totals)
 * @param {Number} forceUseEarlyPayDiscountDetailIndex If forceUseEarlyPayDiscount is used, the index of the discount detail to use within it
 * @param {Shareholder} shareholder Used when calculating the totals for a specific shareholder
 * @param {PurchaseOrder} purchaseOrder When `shareholder` is used, the purchase order is also needed
 */
const customerProductDiscountsTotals = (
  customerProduct,
  dealerDiscounts,
  product,
  forceUseEarlyPayDiscount,
  forceUseEarlyPayDiscountDetailIndex,
  shareholder,
  purchaseOrder,
) => {
  const { applyShareholderPercentage, shareholderPercentage } = getShareholderPercentage(
    shareholder,
    purchaseOrder,
    customerProduct,
  );

  // Get the product total before discounts
  let msrp = customerProduct.msrpEdited ? parseFloat(msrpEdited) : parseFloat(product.msrp || product.costUnit) || 0.0;

  // Apply shareholder percentage
  if (applyShareholderPercentage) msrp = msrp * (shareholderPercentage / 100);

  let data = {
    originalPrice: total(msrp, customerProduct.orderQty),
    discounts: {},
    total: 0.0,
    discountAmount: 0.0,
  };

  msrp = applyDiscounts(
    data,
    msrp,
    dealerDiscounts,
    product,
    customerProduct,
    forceUseEarlyPayDiscount,
    forceUseEarlyPayDiscountDetailIndex,
    applyShareholderPercentage,
    shareholderPercentage,
  );

  // add final return values
  data.total = total(msrp, customerProduct.orderQty);
  data.discountAmount = data.originalPrice - data.total;
  data.shareholderPercentage = shareholderPercentage;

  return data;
};

// https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
const numberToDollars = (number) => {
  return `$${parseFloat(number)
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
};

module.exports = {
  getLastUpdatedDate,
  filterDeletedListResponse,
  getShareholderPercentage,
  customerProductDiscountsTotals,
  numberToDollars,
  setResultToArray,
};

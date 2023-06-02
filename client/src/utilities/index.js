import get from 'lodash/get';
import { LoadingStatus } from '../store/constants';
import { apiActionBuilder, _authHeaders } from '../store/actions/helpers';
import axios from 'axios';

/**
 * Returns the customer product total
 * @param {Number} msrp Product msrp
 * @param {Number} quantity How many of product was ordered
 */
export const SeedTypeMap = {
  B: 'SOYBEAN',
  C: 'CORN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
};

export const total = (msrp, quantity) => {
  return (msrp || 0.0) * quantity;
};

const applyWholeOrderDetailDiscount = (
  discountData,
  totalQuantity,
  detail,
  selectedShareholder,
  purchaseOrder,
  applyAsOverAllTotal,
  id,
) => {
  const { applyShareholderPercentage, shareholderPercentage } = getShareholderPercentage(
    selectedShareholder,
    purchaseOrder,
    { shareholderData: [] },
    true,
  );
  if (applyShareholderPercentage) {
    detail.discountValue = (detail.discountValue * shareholderPercentage) / 100;
  }
  if (detail.unit === '$') {
    let discountAmount = applyAsOverAllTotal
      ? Number(detail.discountValue)
      : Number(detail.discountValue) * totalQuantity;
    discountData.orderDiscountsAmount += discountAmount;
    discountData.orderTotal -= discountAmount;
    discountData.discountDetails[id] = discountAmount;
  } else {
    let discount = discountData.orderTotal * (Number(detail.discountValue) / 100);
    discountData.orderDiscountsAmount += discount;
    discountData.discountDetails[id] = discount;
    discountData.orderTotal -= discount;
  }
};

const applyDollarVolumeDiscountToWholeOrder = (
  discountData,
  totalQuantity,
  discount,
  selectedShareholder,
  purchaseOrder,
) => {
  for (let i = 0; i < discount.detail.length; i++) {
    let detail = discount.detail[i];

    if (
      discountData.orderTotal >= parseFloat(detail.minDollars, 0) &&
      discountData.orderTotal <= parseFloat(detail.maxDollars, 0)
    ) {
      applyWholeOrderDetailDiscount(
        discountData,
        totalQuantity,
        detail,
        selectedShareholder,
        purchaseOrder,
        discount.applyAsOverAllTotal,
        discount.id,
      );
      break;
    }
  }
};

const applyQuantityDiscountToWholeOrder = (
  discountData,
  totalQuantity,
  discount,
  selectedShareholder,
  purchaseOrder,
) => {
  for (let i = 0; i < discount.detail.length; i++) {
    let detail = discount.detail[i];

    if (totalQuantity >= parseInt(detail.minQty, 0) && totalQuantity <= parseInt(detail.maxQty, 0)) {
      applyWholeOrderDetailDiscount(
        discountData,
        totalQuantity,
        detail,
        selectedShareholder,
        purchaseOrder,
        discount.applyAsOverAllTotal,
        discount.id,
      );
      break;
    }
  }
};

const applyFlatAmountDiscountToWholeOrder = (
  discountData,
  totalQuantity,
  discount,
  selectedShareholder,
  purchaseOrder,
) => {
  let detail = discount.detail[0];
  applyWholeOrderDetailDiscount(
    discountData,
    totalQuantity,
    detail,
    selectedShareholder,
    purchaseOrder,
    true,
    discount.id,
  );
};

const applyEarlyPayDiscountToWholeOrder = (
  discountData,
  totalQuantity,
  discount,
  selectedShareholder,
  purchaseOrder,
) => {
  for (let i = 0; i < discount.detail.length; i++) {
    let detail = discount.detail[i];

    if (new Date(detail.date) >= new Date()) {
      applyWholeOrderDetailDiscount(
        discountData,
        totalQuantity,
        detail,
        selectedShareholder,
        purchaseOrder,
        discount.applyAsOverAllTotal,
        discount.id,
      );
      break;
    }
  }
};

export const perWholeOrderDiscount = (
  subTotal,
  totalQuantity,
  purchaseOrder,
  perWholeOrderDiscounts,
  selectedShareholder,
) => {
  const selectedDiscounts = purchaseOrder.dealerDiscounts || [];
  let discountData = {
    orderTotal: subTotal,
    orderDiscountsAmount: 0,
    discountDetails: {},
  };

  selectedDiscounts.forEach((dd) => {
    const discount = perWholeOrderDiscounts.find((item) => item.id === dd.DiscountId);
    if (discount) {
      discount.detail = discount.detail.map((item) => ({ unit: dd.unit, discountValue: dd.discountValue }));
      switch (discount.discountStrategy) {
        case 'Dollar Volume Discount':
          applyDollarVolumeDiscountToWholeOrder(
            discountData,
            totalQuantity,
            discount,
            selectedShareholder,
            purchaseOrder,
          );
          break;
        case 'Quantity Discount':
          applyQuantityDiscountToWholeOrder(discountData, totalQuantity, discount, selectedShareholder, purchaseOrder);
          break;
        case 'Flat Amount Discount':
          applyFlatAmountDiscountToWholeOrder(
            discountData,
            totalQuantity,
            discount,
            selectedShareholder,
            purchaseOrder,
          );
          break;
        case 'Early Pay Discount':
          applyEarlyPayDiscountToWholeOrder(discountData, totalQuantity, discount, selectedShareholder, purchaseOrder);
          break;
        default:
          console.log('discount type not found');
      }
    }
  });

  return discountData;
};

/**
 * Returns whether a shareholder discount percentage should be applied, and the percentage
 * @param {Shareholder} shareholder
 * @param {PurchaseOrder} purchaseOrder
 * @param {CustomerProduct | CustomerCustomProduct} customerProduct
 */
export const getShareholderPercentage = (shareholder, purchaseOrder, customerProduct, isWholeOrder) => {
  const applyShareholderPercentage = shareholder && purchaseOrder !== undefined;
  let shareholderPercentage = 0;
  let shareholderData = [];
  if (!applyShareholderPercentage) return { applyShareholderPercentage, shareholderPercentage };

  if (isWholeOrder) {
    let shareholderData = purchaseOrder.shareholderData.find((data) => data.shareholderId === shareholder.id);
    if (shareholderData) {
      shareholderPercentage = shareholderData.percentage;
      shareholderData = shareholderData;
      return { applyShareholderPercentage, shareholderPercentage, shareholderData };
    } else {
      shareholderPercentage = 0;
    }
  }
  let orderShareholderData = customerProduct.shareholderData.find((d) => d.shareholderId === shareholder.id);
  if (orderShareholderData) {
    shareholderPercentage = orderShareholderData.percentage;
    shareholderData = orderShareholderData;
  } else {
    let farmData = purchaseOrder.farmData.find((data) => data.farmId === customerProduct.farmId);
    if (farmData) {
      let shareholderData = farmData.shareholderData.find((data) => data.shareholderId === shareholder.id);
      if (shareholderData) {
        shareholderPercentage = shareholderData.percentage;
        shareholderData = shareholderData;
      } else {
        shareholderPercentage = 0;
        shareholderData = [];
      }
    } else {
      shareholderPercentage = 0;
    }
  }

  return { applyShareholderPercentage, shareholderPercentage, shareholderData };
};

export const applyDiscounts = (
  data,
  msrp,
  dealerDiscounts,
  product,
  customerProduct,
  forceUseEarlyPayDiscount,
  forceUseEarlyPayDiscountDetailIndex,
  applyShareholderPercentage,
  shareholderPercentage,
  customerProducts,
  editingProduct,
  futureDate,
) => {
  if (!data) {
    data = {
      discounts: {},
    };
  }
  dealerDiscounts &&
    dealerDiscounts.forEach((dealerDiscount) => {
      if (!doesDiscountApply(dealerDiscount, product, customerProduct)) return;
      if (dealerDiscount.perProductOrder === true) return;

      data.discounts[dealerDiscount.id] = {
        value: '',
        amount: 0,
        dealerDiscount,
        detailIndex: null,
        discountDate: '',
        discountStrategy: '',
      };

      let itterator = dealerDiscount.detail;

      if (dealerDiscount.discountStrategy === 'Early Pay Discount' && futureDate) {
        let itter;
        dealerDiscount.detail.forEach((detail) => {
          if (itter) return;

          if (
            new Date(detail.date !== undefined ? detail.date : dealerDiscount.lastDate).toISOString().slice(0, 10) >=
            new Date(futureDate).toISOString().slice(0, 10)
          ) {
            itter = detail;
          }
        });
        if (itter) {
          itterator = [itter];
        } else {
          itterator = [];
        }
      }
      for (let i = 0; i < itterator.length; i++) {
        let discountDetail = itterator[i];
        if (
          !doesDiscountDetailApply(
            customerProduct,
            product,
            dealerDiscount,
            discountDetail,
            msrp,
            customerProducts,
            editingProduct,
            futureDate,
          )
        )
          continue;

        let before = msrp;

        // Flat amount discounts can be set in the purchase_order/discount_selector
        // If this is the case, use the discount as the discountDetail as it may have a different unit or discountValue than the original discount
        if (
          dealerDiscount.discountStrategy === 'Flat Amount Discount' &&
          customerProduct.discounts &&
          customerProduct.discounts.length > 0
        ) {
          let detail = customerProduct.discounts.find((d) => d.DiscountId === dealerDiscount.id);

          if (detail && detail.hasOwnProperty('unit') && detail.hasOwnProperty('discountValue')) {
            if (detail.discountValue !== '') discountDetail = detail;
          }
        }

        if (
          discountDetail.unit === '$' &&
          new Date(
            discountDetail.hasOwnProperty('maxQty')
              ? dealerDiscount.lastDate
              : discountDetail.date !== undefined
              ? discountDetail.date
              : dealerDiscount.lastDate,
          )
            .toISOString()
            .slice(0, 10) >= new Date(futureDate).toISOString().slice(0, 10)
        ) {
          let discount = parseFloat(discountDetail.discountValue || 0);
          if (applyShareholderPercentage) discount = discount * (shareholderPercentage / 100.0);

          msrp = msrp - discount;
          data.discounts[dealerDiscount.id].amount =
            customerProduct.isPickLater == true
              ? customerProduct.pickLaterQty
              : customerProduct.orderQty * (before - msrp);
          data.discounts[dealerDiscount.id].value = `$${discountDetail.discountValue || 0}`;
          data.discounts[dealerDiscount.id].discountDate = discountDetail.date;
          data.discounts[dealerDiscount.id].discountStrategy = dealerDiscount.discountStrategy;
        } else if (
          discountDetail.unit === '%' &&
          new Date(
            discountDetail.hasOwnProperty('maxQty')
              ? dealerDiscount.lastDate
              : discountDetail.date !== undefined
              ? discountDetail.date
              : dealerDiscount.lastDate,
          )
            .toISOString()
            .slice(0, 10) >= new Date(futureDate).toISOString().slice(0, 10)
        ) {
          msrp = msrp - msrp * (parseFloat(discountDetail.discountValue) / 100.0);

          data.discounts[dealerDiscount.id].amount =
            (customerProduct.isPickLater == true ? customerProduct.pickLaterQty : customerProduct.orderQty) *
            (before - msrp);
          data.discounts[dealerDiscount.id].value = `${discountDetail.discountValue}%`;
          data.discounts[dealerDiscount.id].discountDate = discountDetail.date;
          data.discounts[dealerDiscount.id].discountStrategy = dealerDiscount.discountStrategy;
        }

        // If this is an early pay discount only use the first detail that applies, not future discount details
        if (dealerDiscount.discountStrategy === 'Early Pay Discount') break;
      }
    });

  return msrp;
};

/**
 * Calculates per product order discounts
 * @param {DealerDiscount[]} dealerDiscounts Array of all dealer discounts
 * @param {Product} product Product that goes with the customerProduct
 * @param {CustomerProduct | CustomerCustomProduct} customerProduct Single CustomerProduct or CustomerCustomProduct
 * @param {Object} data
 */
const calculatePerProductOrderDiscounts = (dealerDiscounts, product, customerProduct, data) => {
  dealerDiscounts &&
    dealerDiscounts.forEach((dealerDiscount) => {
      if (dealerDiscount.perProductOrder !== true) return;

      if (!doesDiscountApply(dealerDiscount, product, customerProduct)) return;

      if (dealerDiscount.detail.length > 0) {
        let discountDetail = dealerDiscount.detail[0];
        // use the detail found in the customer product if it has been changed
        if (customerProduct.discounts) {
          let customerProductDetail = customerProduct.discounts.find((d) => d.DiscountId === dealerDiscount.id);
          if (
            customerProductDetail &&
            customerProductDetail.hasOwnProperty('unit') &&
            customerProductDetail.hasOwnProperty('discountValue')
          ) {
            discountDetail = customerProductDetail;
          }
        }

        if (discountDetail.unit === '$') {
          data.discounts[dealerDiscount.id] = {
            value: `$${discountDetail.discountValue || 0}`,
            amount: parseFloat(discountDetail.discountValue || 0),
            dealerDiscount,
            detailIndex: null,
            discountDate: discountDetail.date,
            discountStrategy: dealerDiscount.discountStrategy,
          };
          data.total = data.total - parseFloat(discountDetail.discountValue || 0);
        } else if (discountDetail.unit === '%') {
          const amount = data.total * (parseFloat(discountDetail.discountValue || 0) / 100.0);
          data.discounts[dealerDiscount.id] = {
            value: `${discountDetail.discountValue || 0}%`,
            amount,
            dealerDiscount,
            detailIndex: null,
            discountDate: discountDetail.date,
            discountStrategy: dealerDiscount.discountStrategy,
          };
          data.total = data.total - amount;
        }
      }
    });
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
export const customerProductDiscountsTotals = (
  customerProduct,
  dealerDiscounts,
  product,
  forceUseEarlyPayDiscount,
  forceUseEarlyPayDiscountDetailIndex,
  shareholder,
  purchaseOrder,
  editingProduct,
  futureDate,
) => {
  let customerProducts =
    product && product.hasOwnProperty('seedCompanyId')
      ? purchaseOrder &&
        purchaseOrder.CustomerMonsantoProducts &&
        purchaseOrder.CustomerMonsantoProducts.filter((c) => c.isDeleted == false)
      : purchaseOrder &&
        purchaseOrder.CustomerProducts &&
        purchaseOrder.CustomerProducts.filter((c) => c.isDeleted == false);
  // if (editingProduct) {
  //   customerProducts = customerProducts.filter(
  //     (_customerProduct) => _customerProduct.id !== editingProduct.id
  //   );
  // }

  const { applyShareholderPercentage, shareholderPercentage, shareholderData } = getShareholderPercentage(
    shareholder,
    purchaseOrder,
    customerProduct,
  );
  let msrp = 0;
  // Get the product total before discounts
  msrp =
    customerProduct && customerProduct.msrpEdited
      ? parseFloat(customerProduct.msrpEdited)
      : customerProduct.hasOwnProperty('monsantoProductId')
      ? parseFloat(customerProduct.price)
      : (product && product.msrp) || (product && product.costUnit) || customerProduct.price
      ? parseFloat((product && product.msrp) || (product && product.costUnit) || customerProduct.price)
      : 0.0;
  // console.log('customerProducts', customerProduct, 'product', product);
  // Apply shareholder percentage
  if (applyShareholderPercentage) msrp = msrp * (shareholderPercentage / 100);

  let data = {
    originalPrice: total(
      msrp,
      customerProduct.isPickLater == true ? customerProduct.pickLaterQty : customerProduct.orderQty,
    ),
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
    customerProducts,
    editingProduct,
    (futureDate = futureDate !== undefined ? futureDate : customerProduct.orderDate),
    // (futureDate = customerProduct.orderDate),
  );
  // add final return values

  data.productType = customerProduct.hasOwnProperty('monsantoProductId')
    ? 'Bayer'
    : customerProduct.hasOwnProperty('productId')
    ? 'SeedCompany'
    : 'RegularCompany';

  data.companyId = customerProduct.hasOwnProperty('monsantoProductId')
    ? customerProduct.MonsantoProduct
      ? customerProduct.MonsantoProduct.ApiSeedCompany.id
      : 'Bayer'
    : customerProduct.hasOwnProperty('productId')
    ? customerProduct.Product.seedCompanyId
    : customerProduct.CustomProduct
    ? customerProduct.CustomProduct.companyId
    : '0';

  data.total = total(
    msrp,
    customerProduct.isPickLater == true ? customerProduct.pickLaterQty : customerProduct.orderQty,
  );
  calculatePerProductOrderDiscounts(dealerDiscounts, product, customerProduct, data);
  data.shareholderData = customerProduct.shareholderData;
  data.shareholderPercentage = shareholderPercentage.shareholderData || [];
  data.discountAmount = data.originalPrice - data.total;
  data.orderDate = customerProduct.orderDate;
  data.orderQty = customerProduct.isPickLater == true ? customerProduct.pickLaterQty : customerProduct.orderQty;

  return data;
};

/**
 * Returns true if a discount currently applies
 *   * If the `lastDate` hasn't passed
 *   * If the product matches the discount
 *   * If the discount is not a whole order discount
 * @param {DealerDiscount} dealerDiscount
 * @param {Product} product
 * @param {CustomerProduct} CustomerProduct from the database, sometimes referred to as an "order"
 */
export const doesDiscountApply = (dealerDiscount, product = {}, customerProduct) => {
  const {
    seedCompanyIds,
    lastDate,
    detail,
    apiSeedCompanyIds,
    applyToSeedType,
    applyToParticularProducts,
    applyParticularProducts,
    applyToWholeOrder,
  } = dealerDiscount;
  if (product.seedCompanyId) {
    if (
      Object(product).hasOwnProperty('ApiSeedCompany') ||
      product.isMonsantoProduct ||
      Object(product).hasOwnProperty('crossReferenceId')
    ) {
      if (!apiSeedCompanyIds.includes(product.seedCompanyId)) return false;
    } else {
      if (!seedCompanyIds.includes(product.seedCompanyId)) return false;
    }
  }

  if (!detail) return false;
  if (
    customerProduct.discounts &&
    customerProduct.discounts.filter((discount) => discount.DiscountId === dealerDiscount.id).length === 0
  ) {
    return false;
  }

  let orderDate = new Date(customerProduct.orderDate || customerProduct.createdAt);
  if (isNaN(orderDate)) orderDate = new Date();

  if (lastDate && new Date(orderDate).toISOString().slice(0, 10) > new Date(lastDate).toISOString().slice(0, 10))
    return false;

  // console.log(applyToSeedType, 'applyToSeedType', !discountMatchesProductType(dealerDiscount, product));
  if (!discountMatchesProductType(dealerDiscount, product)) return false;
  if (applyToParticularProducts) {
    if (!applyParticularProducts) return false;
    return (applyParticularProducts[product.seedType] || []).includes(product.blend);
  }
  return applyToWholeOrder !== true;
};

/**
 * Returns if a discount detail currently applies
 * @param {CustomerProduct | CustomerCustomProduct} customerProduct
 * @param {DealerDiscount} dealerDiscount
 * @param {object} discountDetail A single discount detail within a DealerDiscount
 * @param {*} amt
 * @param {CustomerProducts | CustomerCustomProducts} customerProducts
 */
export const doesDiscountDetailApply = (
  customerProduct,
  product,
  dealerDiscount,
  discountDetail,
  amt,
  customerProducts,
  editingProduct,
  futureDate,
) => {
  if (dealerDiscount.discountStrategy === 'Dollar Volume Discount') {
    return parseFloat(discountDetail.minDollars, 10) <= amt && parseFloat(discountDetail.maxDollars, 10) >= amt;
  }

  let orderDate = new Date(customerProduct.orderDate || customerProduct.createdAt) || new Date();

  let qty = parseFloat(
    customerProduct.isPickLater == true ? customerProduct.pickLaterQty : customerProduct.orderQty || 0,
  );

  if (
    product &&
    product.hasOwnProperty('seedCompanyId') &&
    dealerDiscount.applyToSeedType &&
    customerProducts &&
    customerProducts.length > 0
  ) {
    customerProducts
      .filter((c) => c.id !== customerProduct.id)
      .forEach((_customerProduct) => {
        if (
          _customerProduct.hasOwnProperty('monsantoProductId')
            ? _customerProduct.MonsantoProduct.seedCompanyId === product.seedCompanyId &&
              _customerProduct.MonsantoProduct.classification === product.classification
            : _customerProduct.Product.seedCompanyId === product.seedCompanyId &&
              _customerProduct.Product.seedType === SeedTypeMap[product.classification]
        ) {
          qty += parseFloat(
            _customerProduct.isPickLater == true ? _customerProduct.pickLaterQty : _customerProduct.orderQty,
          );
        }
      });
  }

  if (
    product &&
    product.hasOwnProperty('seedCompanyId') &&
    dealerDiscount.applyToParticularProducts &&
    (dealerDiscount.applyParticularProducts[SeedTypeMap[product.classification]] || []).includes(product.blend) &&
    customerProducts
  ) {
    customerProducts.forEach((_customerProduct) => {
      if (
        _customerProduct.Product.seedCompanyId === product.seedCompanyId &&
        _customerProduct.Product.seedType === SeedTypeMap[product.classification] &&
        _customerProduct.Product.blend === product.blend
      ) {
        qty += _customerProduct.isPickLater == true ? _customerProduct.pickLaterQty : _customerProduct.orderQty;
      }
    });
  }

  return (
    // check if minQty applies
    (discountDetail['minQty'] ? parseFloat(discountDetail['minQty'], 10) <= qty : true) &&
    // check if maxQty applies
    (discountDetail['maxQty'] ? parseFloat(discountDetail['maxQty'], 10) >= qty : true) &&
    // check if detail Date applies

    // (discountDetail.date ? orderDate < new Date(discountDetail.date) : true)
    (dealerDiscount.lastDate
      ? dealerDiscount.lastDate
      : dealerDiscount.date
      ? orderDate <
        new Date(
          new Date(
            discountDetail.hasOwnProperty('maxQty')
              ? dealerDiscount.lastDate
              : discountDetail.date
              ? discountDetail.date
              : dealerDiscount.lastDate,
          ).getFullYear(),
          new Date(
            discountDetail.hasOwnProperty('maxQty')
              ? dealerDiscount.lastDate
              : discountDetail.date
              ? discountDetail.date
              : dealerDiscount.lastDate,
          ).getMonth(),
          new Date(
            discountDetail.hasOwnProperty('maxQty')
              ? dealerDiscount.lastDate
              : discountDetail.date
              ? discountDetail.date
              : dealerDiscount.lastDate,
          ).getDate(),
          23,
          59,
          59,
        )
      : true)
  );
};

export const discountMatchesProductType = (dealerDiscount, product) => {
  if (dealerDiscount && dealerDiscount.perProductOrder === true) return true;

  if (
    SeedTypeMap[product.classification] !== undefined ||
    Object(product).hasOwnProperty('ApiSeedCompany') ||
    product.isMonsantoProduct
  ) {
    return (
      dealerDiscount &&
      dealerDiscount.productCategories[product.seedCompanyId] &&
      dealerDiscount &&
      dealerDiscount.productCategories[product.seedCompanyId].includes(SeedTypeMap[product.classification])
    );
  } else if (product.seedType) {
    return (
      dealerDiscount &&
      dealerDiscount.productCategories[product.seedCompanyId] &&
      dealerDiscount &&
      dealerDiscount.productCategories[product.seedCompanyId].includes(product.seedType)
    );
  } else {
    return (
      dealerDiscount && dealerDiscount.companyIds.length > 0 && dealerDiscount.companyIds.includes(product.companyId)
    );
  }
};

// https://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-dollars-currency-string-in-javascript
export const numberToDollars = (number) => {
  let x = `$${parseFloat(number)
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+\.)/g, '$1,')}`;
  if (x === '$-0.00') x = '$0.00';
  return x;
};

// Offline action helpers
export const getId = (item) => get(item, 'id') || get(item, 'meta.id');
export const metaId = (item) => get(item, 'meta.id');
export const isPending = (item) => get(item, 'meta.pending');

/**
 * For "List" type actions (i.e. `listPurchaseOrders`), if we have already loaded the list then
 * instead of sending the full request again we send a request to the server to fetch the last time
 * an item has been updated.  If the servers last update is newer than the last updated stored in the reducer
 * then go ahead and make the request to get the list from the server again.
 * @param {*} forceUpdate Force the list request, ignore any caching
 * @param {*} reducer The reducer we are using
 * @param {*} types The store constant to use in the `dispatch`
 * @param {*} url The redux-offline url for the list action
 * @param {*} lastUpdateUrl The url used to fetch the last update from the server
 * @param {*} dispatch The dispatch function passed from the action
 * @param queryParams for specific requests
 */
export const cachedListAction = async (forceUpdate, reducer, types, url, lastUpdateUrl, dispatch, queryParams) => {
  const loadingStatus = reducer.loadingStatus;
  let query = '';
  if (queryParams) {
    query = buildQueryString(queryParams);
  }
  if (forceUpdate || isUnloaded(loadingStatus)) {
    return dispatch(
      apiActionBuilder.get({
        types,
        url,
        query,
      }),
    );
  } else {
    if (lastUpdateUrl[0] !== '/') lastUpdateUrl = '/' + lastUpdateUrl;
    return axios.get(`${process.env.REACT_APP_API_BASE}${lastUpdateUrl}`, _authHeaders()).then((response) => {
      let lastUpdate = reducer.lastUpdate;
      if (new Date(lastUpdate) < new Date(response.data.lastUpdate)) {
        return dispatch(
          apiActionBuilder.get({
            types,
            url,
            query,
          }),
        );
      }
    });
  }
};

export const buildQueryString = (queryParams) => {
  if (typeof data === 'string') return queryParams;
  return (
    '?' +
    Object.keys(queryParams)
      .map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`;
      })
      .join('&')
  );
};

/**
 * Return the most recent `lastUpdated` date from the array of `items`
 * @param {Array} items Any database list where each object contains a `lastUpdated` date
 */
export const getLastUpdatedDate = (items) => {
  let last = items.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0] || {};
  return last.updatedAt || null;
};

// Loading status helpers
export const isUnloaded = (status) => status === LoadingStatus.Unloaded;
export const isLoading = (status) => status === LoadingStatus.Loading;
export const isUnloadedOrLoading = (status) => [LoadingStatus.Loading, LoadingStatus.Unloaded].includes(status);
export const isLoaded = (status) => status === LoadingStatus.Loaded;

import { groupBy } from 'lodash';
/**
 * Returns a name (short descriptor) for a custom product
 * @param {Object} product Product from the database
 */
export const getCustomProductName = (product) => {
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
export const getProductName = (product, seedCompanies) => {
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
export const getQtyOrdered = (product) => {
  if (product == undefined || product.lots == null) return 0;
  return product.lots
    .filter((lot) => lot.source === 'Seed Company')
    .reduce((acc, lot) => {
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
  if (product == undefined || product.lots == null) return 0;
  return product.lots
    .filter((lot) => lot.isDeleted == false && lot.source === 'Seed Company')
    .reduce((acc, lot) => {
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
 * Return the total transfer in from seed dealer for a product, the sum of all lots `quantity` where source is "Seed Dealer Transfer In"
 * @param {Object} product Product from he database, containing a `lots` attribute
 */
export const getTransferInAmount = (product) => {
  if (product.hasOwnProperty('seedCompanyId')) {
    if (product == undefined || product.lots == null) return 0;
    return product.lots
      .filter((lot) => lot.isDeleted == false && lot.source === 'Seed Dealer Transfer In')
      .reduce((acc, lot) => {
        let amt = Number(lot.quantity, 10) || 0;
        return acc + amt;
      }, 0);
  } else if (product.hasOwnProperty('companyId')) {
    if (product.customLots == null) return 0;
    return product.customLots
      .filter((lot) => lot.isDeleted == false && lot.source === 'Transfer In')
      .reduce((acc, lot) => {
        let amt = Number(lot.quantity, 10) || 0;
        return acc + amt;
      }, 0);
  }
};
// monstanto product items

/**
 * Return the total transfer out from seed dealer for a product, the sum of all lots `quantity` where source is "Seed Dealer Transfer Out"
 * @param {Object} product Product from he database, containing a `lots` attribute
 */
export const getTransferOutAmount = (product) => {
  if (product.hasOwnProperty('seedCompanyId')) {
    if (product == undefined || product.lots == null) return 0;
    return product.lots
      .filter((lot) => lot.isDeleted == false && lot.source === 'Seed Dealer Transfer Out')
      .reduce((acc, lot) => {
        let amt = Number(lot.quantity, 10) || 0;
        return acc + amt;
      }, 0);
  } else if (product.hasOwnProperty('companyId')) {
    if (product.customLots == null) return 0;
    return product.customLots
      .filter((lot) => lot.isDeleted == false && lot.source === 'Transfer Out')
      .reduce((acc, lot) => {
        let amt = Number(lot.quantity, 10) || 0;
        return acc + amt;
      }, 0);
  }
};

/**
 * Return the grower order amount for a product
 * @param {Object} product Product from the database
 * @param {Object[]} customerProducts Array of all customerProducts
 */
export const getGrowerOrder = (product, customerProducts) => {
  return (
    customerProducts &&
    customerProducts
      .filter((order) => order.productId === product.id)
      .reduce((acc, order) => Number(acc) + Number(order.orderQty), 0)
  );
};

/**
 * Returns the grower amount delivered for a product
 * @param {Object} product Product from the database
 * @param {Object[]} deliveryReceiptDetails Single (flattened) array of all delivery receipt details from all delivery receipts
 */
export const getGrowerOrderDelivered = (product, deliveryReceiptDetails) => {
  let productLotIds = (product.lots || product.customLots || product.monsantoLots || [])
    .filter((l) => l.isDeleted == false)
    .map((l) => l.id);
  return deliveryReceiptDetails
    .filter((detail) => productLotIds.includes(detail.lotId))
    .reduce((acc, detail) => Number(acc) + Number(detail.amountDelivered), 0);
};

export const getDeliveryLotsQtyReturn = (deliveryReceiptDetails, deliveryReceipts) => {
  let amt = 0;
  deliveryReceipts.map((dr) => {
    dr.isReturn === true &&
      deliveryReceiptDetails.map((dd) => {
        if (dr.id === dd.deliveryReceiptId) {
          amt = amt + Number(dd.amountDelivered);
        }
      });
  });
  return amt;
};
export const getDeliveryLotsQty = (deliveryReceiptDetails, deliveryReceipts) => {
  let amt = 0;

  deliveryReceipts.map((dr) => {
    dr.isReturn === false &&
      deliveryReceiptDetails.map((dd) => {
        if (dr.id === dd.deliveryReceiptId) {
          amt = amt + Number(dd.amountDelivered);
        }
      });
  });
  return amt;
};
export const getWareHouseValue = (product) => {
  let productLotIds = product.lots || product.customLots || product.monsantoLots || [];
  if (productLotIds == null) return 0;
  return productLotIds
    .filter((p) => p.isDeleted == false)
    .reduce((acc, lot) => {
      let amt = Number(lot.quantity, 10) || 0;
      if (lot.source === 'Transfer Out' || lot.isReturn == true || lot.source === 'Seed Dealer Transfer Out') {
        amt = -Math.abs(amt);
      } else if (lot.source === 'Transfer In' || lot.source === 'Seed Dealer Transfer In') {
        amt = Math.abs(amt);
      }

      return acc + amt;
    }, 0);
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
    if (order.hasOwnProperty('monsantoProductId')) return p.id === order.monsantoProductId;
    return p.hasOwnProperty('name') && p.id === order.customProductId;
  });
};

/**
 * Returns a `Product` object from an order (CustomerProduct)
 * @param {Object[]} customers Customers from the database
 * @param {String} companyType Company Type:Seed Company,Company, Api Seed Company
 * @param {number} companyId Id of company
 */
export const getCustomerProducts = (customers, companyType, companyId, deliveryReceipts, isDublicate) => {
  let productRelatedPurchaseOrder = [];
  customers.forEach((customer) => {
    customer.PurchaseOrders.forEach((purchaseOrder) => {
      const products =
        companyType === 'Company'
          ? purchaseOrder.CustomerCustomProducts
          : companyType === 'Seed Company'
          ? purchaseOrder.CustomerProducts
          : companyType === 'Api Seed Company'
          ? purchaseOrder.CustomerMonsantoProducts
          : [];
      products
        .filter((p) => p.orderQty > 0)
        .forEach((product) => {
          const productCompanyId =
            companyType === 'Company'
              ? product.CustomProduct.companyId
              : companyType === 'Seed Company'
              ? product.Product.seedCompanyId
              : companyType === 'Api Seed Company'
              ? product.MonsantoProduct.seedCompanyId
              : null;

          if (productCompanyId === companyId) {
            let qtyd = 0;

            deliveryReceipts &&
              deliveryReceipts.filter((item) => {
                if (item.purchaseOrderId === purchaseOrder.id && item.isReturn == false) {
                  item.DeliveryReceiptDetails.filter(
                    (s) => s.customerMonsantoProductId === product.id && product.orderQty > 0,
                  ).map((d) => {
                    qtyd += Number(d.amountDelivered);
                  });
                }
              });

            productRelatedPurchaseOrder.push({
              customer: { id: customer.id, name: customer.name },
              purchaseOrder: { id: purchaseOrder.id, name: purchaseOrder.name, isQuote: purchaseOrder.isQuote },
              productId:
                companyType === 'Company'
                  ? product.customProductId
                  : companyType === 'Seed Company'
                  ? product.productId
                  : companyType === 'Api Seed Company'
                  ? product.monsantoProductId
                  : null,
              crossReferenceId:
                companyType === 'Api Seed Company'
                  ? product.MonsantoProduct && product.MonsantoProduct.crossReferenceId
                  : null,
              zoneId:
                companyType === 'Api Seed Company' ? product.MonsantoProduct && product.MonsantoProduct.zoneId : null,
              productDetail:
                companyType === 'Api Seed Company'
                  ? product.MonsantoProduct && product.MonsantoProduct.productDetail
                  : null,
              customerProductId: product.id,
              purchaseOrderId: purchaseOrder.id,
              // quantity: companyType === 'Api Seed Company' ? product.monsantoOrderQty : product.orderQty,
              quantity: companyType === 'Api Seed Company' ? product.orderQty : product.orderQty,
              qtyDelivered: qtyd,
              isSent: product.isSent,
              product: product,
            });
          }
        });
    });
  });

  return companyType === 'Api Seed Company'
    ? isDublicate
      ? groupBy(productRelatedPurchaseOrder, (product) => product.crossReferenceId)
      : groupBy(productRelatedPurchaseOrder, (product) => product.productId)
    : groupBy(productRelatedPurchaseOrder, (product) => product.productId);
};

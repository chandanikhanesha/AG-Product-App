const { Router } = require('express');
const request = require('request-promise');
const config = require('config').getConfig();
const Sequelize = require('sequelize');
const { create: actionLogCreator } = require('../middleware/actionLogCreator');
const { parseProductBookingError, calculateSeedYear } = require('../utilities/xml/common');
const {
  productBooking: { buildProductBookingRequest, parseProductBookingResponse },
  common: { parseXmlStringPromise, parseMainProductBookingError },
} = require('utilities/xml');
const fs = require('fs');
const path = require('path');
const { create: transferLog } = require('../middleware/transferLog');

const hardCodeXml = fs.readFileSync(
  path.join(__dirname, '../utilities/xmlResponse/gtogTransfer(fromBenToLarry)_response.xml'),
  {
    encoding: 'utf8',
  },
);
const bayerAPIDown = process.env.IS_BAYER_API_DOWN;
const {
  CustomerMonsantoProduct,
  Customer,
  MonsantoProduct,
  ApiSeedCompany,
  Organization,
  MonsantoProductLineItem,
  PurchaseOrder,
  DiscountReport,
  CustomerProduct,
  CustomerCustomProduct,
  CustomProduct,
  Product,
  Farm,
} = require('models');

const { create: monsantoReqLogCreator } = require('../middleware/monsantoReqLogCreator');
const router = (module.exports = Router({ mergeParams: true }));
const { filterDeletedListResponse } = require('utilities');
// const { calculateSeedYear } = require('../utilities/xml/common');

module.exports.list = (req, res) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
      isDeleted: false,
    },
    include: [
      {
        model: MonsantoProduct,
        as: 'MonsantoProduct',

        include: [
          {
            model: MonsantoProductLineItem,
            as: 'LineItem',
          },
          {
            model: ApiSeedCompany,
            as: 'ApiSeedCompany',
          },
        ],
      },
      { model: Farm, as: 'Farm' },

      {
        model: PurchaseOrder,
        as: 'PurchaseOrder',
      },
    ],
  };
  CustomerMonsantoProduct.all(query)
    .then((customProducts) => res.json(filterDeletedListResponse(customProducts)))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching product' });
    });
};

module.exports.create = async (req, res) => {
  const organizationId = req.user.organizationId;
  let {
    purchaseOrderId,
    productId,
    quantity,
    discounts,
    shareholderData,

    farmId,
    unit,
    fieldName,
    orderDate,
    price,
    monsantoProductReduceTransferInfo,
    comment,
    isSent,
    isPickLater,
    pickLaterQty,
    pickLaterProductId,
  } = req.body;
  const po = await PurchaseOrder.findOne({
    where: {
      id: purchaseOrderId,
      organizationId: organizationId,
    },
    raw: true,
  });
  let lineNumber;
  let lineItemNumber;
  let currentOrders = await CustomerMonsantoProduct.findAll({
    where: {
      purchaseOrderId: purchaseOrderId,
      // monsantoProductId: productId,
      // isDeleted: false
    },
    attributes: ['lineItemNumber'],
    group: ['purchaseOrderId', 'lineItemNumber'],
    order: [[Sequelize.cast(Sequelize.col('lineItemNumber'), 'INTEGER'), 'DESC']],
    limit: 1,
  });
  if (!currentOrders || !currentOrders.length) {
    lineNumber = '999999';
    lineItemNumber = '1';
  } else {
    lineNumber = '999999';
    lineItemNumber = parseInt(currentOrders[0].lineItemNumber) + 1;
  }

  await CustomerMonsantoProduct.create({
    purchaseOrderId: purchaseOrderId,
    farmId: req.body.farmId ? req.body.farmId : null,
    organizationId: organizationId,
    monsantoProductId: productId,
    orderQty: quantity,
    unit,
    lineNumber,
    lineItemNumber,
    discounts,
    shareholderData,
    orderDate,
    price,
    comment,
    fieldName,
    monsantoOrderQty: isSent ? quantity : null,
    isSent: isSent ? isSent : false,
    isReplant: po ? po.isReplant : false,
    isPickLater: isPickLater,
    pickLaterQty: pickLaterQty ? pickLaterQty : 0,
    pickLaterProductId: pickLaterProductId ? pickLaterProductId : null,
  })
    .then(async (customerProduct) => {
      const monsantoProduct = await MonsantoProduct.findById(productId);
      const po = await PurchaseOrder.findById(purchaseOrderId);
      transferLog({
        req,
        productName: monsantoProduct.dataValues.productDetail,
        action: {
          AddedNewRow:
            customerProduct.dataValues.isSent === false
              ? ` AddNewproduct With ${quantity} Quantity`
              : `Grower To Grower Transfer [ToCustomer] ${quantity}`,
        },
        otherDetail: {
          BayerStatus:
            po.dataValues.isSimple === false
              ? isSent
                ? isSent === true
                  ? 'Grower To Grower Transfer [ToCustomer] '
                  : 'UnSynced'
                : 'UnSynced'
              : 'NoStatus',
          OrderType: po.dataValues.isSimple === true ? 'Quote' : 'PurchaseOrder',
        },
        purchaseOrderId: purchaseOrderId,
        productId: productId,
        rowId: customerProduct.dataValues.id,
      });

      DiscountReport.update({ isLoad: true }, { where: { purchaseOrderId: purchaseOrderId } });
      return res.json(customerProduct);
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error creating bayer customer product' });
    });
  // let query = {
  //   purchaseOrderId: purchaseOrderId,
  //   monsantoProductId: productId,
  //   isDeleted: false,
  // };
  // if (req.body.farmId) {
  //   query['farmId'] = req.body.farmId;
  // }
  // let checkExistance = await CustomerMonsantoProduct.findAll({
  //   where: query,
  // });

  // if (checkExistance.length > 0) {
  //   CustomerMonsantoProduct.findAll({
  //     where: { id: checkExistance[0].dataValues.id },
  //   }).then(function (monsantoProduct) {
  //     // Check if record exists in db
  //     let data = req.body;
  //     data.orderQty = parseFloat(monsantoProduct[0].dataValues.orderQty) + parseFloat(data.quantity);
  //     data.monsantoProductId = data.productId;
  //     data.isSent = false;
  //     delete data.monsantoProductReduceTransferInfo;
  //     delete data.purchaseOrderId;
  //     delete data.productId;
  //     delete data.farmId;
  //     delete data.unit;
  //     delete data.fieldName;
  //     if (monsantoProduct) {
  //       monsantoProduct[0]
  //         .update(data)
  //         .then(() => {
  //           res.status(200).json(monsantoProduct);
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //           res.status(500).json({ error: `Unable to edit customer product: ${err}` });
  //         });
  //     }
  //   });
  // } else {

  // }
};

module.exports.updateQuote = async (req, res) => {
  try {
    let msg = 'Successfully updated!';
    let productType = req.body.IDname;
    console.log(productType);
    const product =
      productType === 'MonsantoProduct'
        ? await CustomerMonsantoProduct.findById(req.params.id)
        : productType === 'CustomerCustomProduct'
        ? await CustomerCustomProduct.findById(req.params.id)
        : await CustomerProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: `Unable to find  bayer customer product with ID: ${req.params.id}`,
      });
    }
    let body = req.body.data;
    delete body.purchaseOrderId;
    delete body.isQuote;
    delete body.productId;
    await product
      .update(body, {
        where: {
          id: req.params.id,
        },
      })
      .then(async () => {
        const ProductData =
          productType === 'MonsantoProduct'
            ? await MonsantoProduct.findById(product.dataValues.monsantoProductId)
            : productType === 'CustomerCustomProduct'
            ? await CustomProduct.findById(product.dataValues.customProductId)
            : await Product.findById(product.dataValues.productId);

        transferLog({
          req,
          productName:
            productType === 'MonsantoProduct'
              ? ProductData.dataValues.productDetail
              : productType === 'CustomerCustomProduct'
              ? ProductData.dataValues.name
              : `${ProductData.dataValues.brand} - ${ProductData.dataValues.blend}`,
          action: {
            UpdatedRow: `Row Updated with ${body.orderQty}`,
          },
          otherDetail: {
            Status: 'Updated Successfully',

            OrderType: 'Quote',
          },
          purchaseOrderId: product.dataValues.purchaseOrderId,
          productId: ProductData.dataValues.id,
          rowId: req.params.id,
        });

        console.log('here');
        res.status(200).json({ msg: msg, data: product });
      })
      .catch((e) => {
        console.log(e, 'error while updating quote');
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

module.exports.update = async (req, res) => {
  const { monsantoProductId } = req.body;

  try {
    const customerMonsantoProduct = await CustomerMonsantoProduct.findOne({
      where: { id: req.params.id },
      raw: true,
    });

    const syncMonsantoProductIds = [];
    let msg = 'Successfully updated!';

    //finished code
    if (
      !req.body.monsantoProductReduceTransferInfo &&
      (customerMonsantoProduct.monsantoProductId == monsantoProductId || !monsantoProductId)
    ) {
      const { farmId, shareholderData, discounts, comment } = req.body;
      let query = { isReplant: req.body.isReplant };
      if (req.body.farmId) {
        query['farmId'] = farmId;
      }
      if (req.body.shareholderData) {
        query['shareholderData'] = shareholderData;
      }
      if (req.body.discounts) {
        query['discounts'] = discounts;
      }
      if (req.body.comment) {
        query['comment'] = req.body.comment;
      }
      if (req.body.orderDate) {
        query['orderDate'] = req.body.orderDate;
      }
      if (req.body.fieldName) {
        query['fieldName'] = req.body.fieldName;
      }

      const customerMonsantoProductUpdate = await CustomerMonsantoProduct.update(query, {
        where: {
          id: req.params.id,
        },
      })
        .then((data) => {
          console.log('data', data);
        })
        .catch((e) => {
          console.log(e, 'e');
        });

      const customerMonsantoProduct = await CustomerMonsantoProduct.findOne({
        where: { id: req.params.id },
      });
      await DiscountReport.update(
        { isLoad: true },
        {
          where: { purchaseOrderId: customerMonsantoProduct ? customerMonsantoProduct.dataValues.purchaseOrderId : '' },
        },
      );

      res.status(200).json({ msg: msg, data: customerMonsantoProduct });
    } else {
      const customerMonsantoProduct = await CustomerMonsantoProduct.findByPk(req.params.id);
      const { isSent, purchaseOrderId, orderQty, monsantoOrderQty, unit } = customerMonsantoProduct.dataValues;
      syncMonsantoProductIds.push(monsantoProductId);
      if (!customerMonsantoProduct) {
        return res.status(404).json({
          error: `Unable to find  bayer customer product with ID: ${req.params.id}`,
        });
      }
      let { amountDelivered, monsantoProductReduceTransferInfo } = req.body;

      if (amountDelivered) {
        console.log('\ngot amount delivered : ', amountDelivered, '\n');
        EditLotQuantities(customerMonsantoProduct.amountDelivered, amountDelivered);
      }

      const reduceQuantity = monsantoProductReduceTransferInfo && monsantoProductReduceTransferInfo.reduceQuantity;

      if (isSent && reduceQuantity > 0) {
        const monsantoProduct = await MonsantoProduct.findById(monsantoProductId);
        const organization = await Organization.findById(monsantoProduct.dataValues.organizationId);
        const apiSeedCompany = await ApiSeedCompany.findOne({
          where: {
            organizationId: monsantoProduct.dataValues.organizationId,
            isDeleted: false,
          },
        });
        const organizationName = organization.dataValues.name;
        const organizationAddress = organization.dataValues.address;
        const organizationBusinessCity = organization.dataValues.businessCity;
        const organizationBusinessState = organization.dataValues.businessState;
        const organizationBusinessZip = organization.dataValues.businessZip;
        const seedCompanyId = monsantoProduct.dataValues.seedCompanyId;
        const seedDealerMonsantoId = apiSeedCompany.dataValues.technologyId;

        let x = new Date().toISOString().split('Z');
        let x1 = x[0].split('.');
        let x2 = x1[0] + '-05:00';

        if (
          monsantoProductReduceTransferInfo.transferWay === 'toHolding' ||
          monsantoProductReduceTransferInfo.transferWay === 'toGrower'
        ) {
          const customerId = req.body.FromCustomerdetail.customerId;
          const FromCustomer = await Customer.findOne({
            where: {
              id: customerId,
            },
          });
          const toCustomerId = monsantoProductReduceTransferInfo.growerInfo.customerId;
          const toCustomer = await Customer.findOne({
            where: {
              id: toCustomerId,
            },
          });
          const TocustomerPurchaseOrderId = monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId;

          const toCustomerOrders = await CustomerMonsantoProduct.all({
            where: {
              purchaseOrderId: TocustomerPurchaseOrderId,
              monsantoProductId: monsantoProductId,
            },
            include: [
              {
                model: MonsantoProduct,
                include: [{ model: MonsantoProductLineItem, as: 'LineItem' }],
              },
              {
                model: PurchaseOrder,
                as: 'PurchaseOrder',
              },
            ],
          });

          const fromCustomerOrders = await CustomerMonsantoProduct.all({
            where: {
              id: req.params.id,
              monsantoProductId: monsantoProductId,
            },
            include: [
              {
                model: MonsantoProduct,
                include: [{ model: MonsantoProductLineItem, as: 'LineItem' }],
              },
              {
                model: PurchaseOrder,
                as: 'PurchaseOrder',
              },
            ],
          });
          const isToSalesOrderReference =
            toCustomerOrders[0] && toCustomerOrders[0].dataValues.PurchaseOrder
              ? toCustomerOrders[0].dataValues.PurchaseOrder.dataValues.salesOrderReference
              : false;
          const isFromSalesOrderReference =
            fromCustomerOrders[0] && fromCustomerOrders[0].dataValues.PurchaseOrder
              ? fromCustomerOrders[0].dataValues.PurchaseOrder.dataValues.salesOrderReference
              : false;

          const getFromCustomerProducts = () => {
            return fromCustomerOrders
              .filter((order) => order.orderQty > 0 && order.isDeleted == false)
              .map((order) => {
                const increaseOrDecrease = {
                  type: 'Decrease',
                  unit: order.unit,
                };
                const value = reduceQuantity;
                increaseOrDecrease.value = Math.abs(value);
                const qtyValue = order.monsantoOrderQty - monsantoProductReduceTransferInfo.reduceQuantity;
                return {
                  lineNumber: order.lineNumber || '999999',
                  lineItemNumber: order.lineItemNumber,
                  action: qtyValue == 0 ? 'Delete' : qtyValue > 0 ? 'Change' : 'Add',
                  requestedDate: order.requestedDate || x2,
                  crossReferenceProductId: order.MonsantoProduct.crossReferenceId,
                  increaseOrDecrease,
                  quantity: {
                    value: qtyValue,
                    unit: order.unit,
                  },
                  orderQty: order.monsantoOrderQty - monsantoProductReduceTransferInfo.reduceQuantity,
                  monsantoOrderQty: order.monsantoOrderQty,
                  requestedShipDate: x2, // ASK sourabh
                  isDeleted: order.isDeleted,
                  lineItem: order.MonsantoProduct.LineItem,
                  // "specialInstructions": {
                  // "type": "General",
                  //   "content": "Plant Early"
                  // }//Optional,
                };
              });
          };
          const getToCustomerProducts = () => {
            return toCustomerOrders
              .filter(
                (order) =>
                  order.orderQty > 0 &&
                  order.isDeleted == false &&
                  monsantoProductReduceTransferInfo.growerInfo.lineItemNumber !== null &&
                  monsantoProductReduceTransferInfo.growerInfo.lineItemNumber !== 'newline' &&
                  order.lineItemNumber == monsantoProductReduceTransferInfo.growerInfo.lineItemNumber,
              )
              .map((order) => {
                const increaseOrDecrease = {
                  type: 'Increase',
                  unit: order.unit,
                };
                let productAction = '';

                if (order.monsantoOrderQty === undefined || order.monsantoOrderQty === null) {
                  increaseOrDecrease.value = monsantoProductReduceTransferInfo.reduceQuantity;

                  productAction = 'Add';
                } else if (order.orderQty == 0) {
                  productAction = 'Delete';
                } else {
                  productAction = 'Change';
                  const diff = order.monsantoOrderQty - order.orderQty;
                  increaseOrDecrease.value = reduceQuantity || Math.abs(diff);
                }
                return {
                  lineNumber: order.lineNumber || '999999',
                  lineItemNumber: order.lineItemNumber,
                  action: productAction,
                  requestedDate: order.requestedDate || x2,
                  crossReferenceProductId: order.MonsantoProduct.crossReferenceId,
                  increaseOrDecrease,
                  quantity: {
                    value:
                      productAction == 'Change'
                        ? parseFloat(order.orderQty) + parseFloat(reduceQuantity || 0)
                        : order.orderQty,
                    unit: order.unit,
                  },
                  orderQty: order.orderQty,
                  monsantoOrderQty: order.monsantoOrderQty,
                  requestedShipDate: x2, // ASK sourabh
                  isDeleted: order.isDeleted,
                  lineItem: order.MonsantoProduct.LineItem,
                  // "specialInstructions": {
                  // "type": "General",
                  //   "content": "Plant Early"
                  // }//Optional,
                };
              });
          };

          const monsantoRequest = {
            orders: [
              {
                orderType: 'Changed',
                orderNumber: purchaseOrderId,
                productYear: calculateSeedYear(),
                directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
                issuedDate: x2,
                orderReference: isFromSalesOrderReference,
                // specialInstructions: {
                //   type: "MarkingInstructions",
                //   content: "West Farm"
                // }, // TODO: commented until we discuss or support this on the UI
                shipTo: {
                  name: FromCustomer.organizationName || FromCustomer.name, //TODO discusss if organization name should be mandatory
                  identifier:
                    FromCustomer.name == 'Bayer Dealer Bucket'
                      ? '1100064726737'
                      : FromCustomer.glnId !== null
                      ? FromCustomer.glnId
                      : FromCustomer.monsantoTechnologyId,
                  agency:
                    FromCustomer.name == 'Bayer Dealer Bucket'
                      ? 'GLN'
                      : FromCustomer.glnId !== null
                      ? 'GLN'
                      : 'AssignedBySeller',
                  addressInformation: {
                    city: FromCustomer.businessCity || '',
                    state: FromCustomer.businessState || 'NE',
                    postalCode: FromCustomer.businessZip || '10000',
                    postalCountry: 'US', //TODO: ask sourabh
                    address: FromCustomer.deliveryAddress || '',
                  },
                },
                products: getFromCustomerProducts(),
                seedCompanyId,
              },
              {
                orderType: isToSalesOrderReference ? 'Changed' : 'New',
                orderNumber: TocustomerPurchaseOrderId,
                productYear: calculateSeedYear(),
                directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
                issuedDate: x2,
                orderReference: isToSalesOrderReference,
                // specialInstructions: {
                //   type: "MarkingInstructions",
                //   content: "West Farm"
                // }, // TODO: commented until we discuss or support this on the UI
                shipTo: {
                  name: toCustomer.organizationName || toCustomer.name, //TODO discusss if organization name should be mandatory
                  identifier:
                    toCustomer.name == 'Bayer Dealer Bucket'
                      ? '1100064726737'
                      : toCustomer.glnId !== null
                      ? toCustomer.glnId
                      : toCustomer.monsantoTechnologyId,
                  agency:
                    toCustomer.name == 'Bayer Dealer Bucket'
                      ? 'GLN'
                      : toCustomer.glnId !== null
                      ? 'GLN'
                      : 'AssignedBySeller',
                  addressInformation: {
                    city: toCustomer.businessCity || '',
                    state: toCustomer.businessState || 'NE',
                    postalCode: toCustomer.businessZip || '10000',
                    postalCountry: 'US', //TODO: ask sourabh
                    address: toCustomer.deliveryAddress || '',
                  },
                },
                products: getToCustomerProducts(),
                seedCompanyId,
              },
            ],
            organizationName,
            seedDealerMonsantoId,
            organizationAddress,
            organizationBusinessCity,
            organizationBusinessState,
            organizationBusinessZip,
            // res
          };

          const monsantoUserData = await ApiSeedCompany.findOne({
            where: { organizationId: req.user.organizationId },
          });
          const xmlStringRequest = await makeProductBookingRequest(monsantoRequest, monsantoUserData);

          const response = await request.post(config.monsantoEndPoint, {
            'content-type': 'text/plain',
            body: xmlStringRequest,
          });
          const responseString = await parseXmlStringPromise(response);
          const monsantoResponse = await parseProductBookingResponse(responseString);

          let productToReturn;
          const { properties, details, impactSummary } = monsantoResponse;
          console.log(impactSummary, 'impactSummary');

          if (properties[0].responseStatus === 'E' && properties[1].responseStatus === 'E') {
            monsantoReqLogCreator({
              req,
              userName: FromCustomer.name + '(' + customerId + ')',
              type: 'product booking(changed)',
              uuid: monsantoResponse.uuid,
              description: JSON.stringify(properties),
            });

            // transferLog({
            //   req,
            //   productName: monsantoProduct.dataValues.productDetail,
            //   action: { EditRow: `${quantity} Quantity` },
            //   otherDetail: { BayerStatus: 'UnSynced' },
            //   purchaseOrderId: purchaseOrderId,
            //   productId: productId,
            //   rowId: customerProduct.dataValues.id,
            // });

            console.log('yehhh i am in if of update');

            const toCustomerProduct = await CustomerMonsantoProduct.findOne({
              purchaseOrderId: TocustomerPurchaseOrderId,
              monsantoProductId: monsantoProductId,
              isDeleted: false,
              lineItemNumber: monsantoProductReduceTransferInfo.growerInfo.lineItemNumber,
            });

            if (toCustomerProduct.dataValues.orderQty - reduceQuantity > 0) {
              // we will update created product
              await toCustomerProduct.update({
                orderQty: toCustomerProduct.dataValues.orderQty - reduceQuantity,
              });
            } else {
              // we have to delete that product
              await CustomerMonsantoProduct.destroy({
                where: {
                  purchaseOrderId: TocustomerPurchaseOrderId,
                  monsantoProductId: monsantoProductId,
                  isDeleted: false,
                  lineItemNumber: monsantoProductReduceTransferInfo.growerInfo.lineItemNumber,
                },
              });
            }
            throw new Error(
              `${properties[0].responseStatus[`description`]} and ${properties[1].responseStatus[`description`]}`,
            );
          } else {
            const orderNumberList = [];
            Object.keys(properties).map((item) => orderNumberList.push(properties[item].orderNumber));
            //update Customer bayer Product
            const tocustomerInfo = monsantoProductReduceTransferInfo.growerInfo;
            console.log('im in else part');
            for (let i = 0; i < details.length; i++) {
              const { responseStatus = '' } = details[i];
              if (responseStatus) {
                if (responseStatus.identifier === 'E') {
                  throw new Error(responseStatus.description);
                }
                if (responseStatus.identifier === 'I') {
                  msg = responseStatus.description;
                }
              }
              let crossRefIdentifier = properties[i] && properties[i].crossRefIdentifier;

              const isDeleted = parseFloat(details[i].quantity.value, 10) === 0 ? true : false;
              console.log(details[i], 'details[i]');

              if (
                customerMonsantoProduct &&
                customerMonsantoProduct.dataValues.id == req.params.id &&
                orderNumberList[i] == customerMonsantoProduct.dataValues.purchaseOrderId
              ) {
                let body = req.body;
                delete body.packagingId;
                delete body.seedSizeId;
                delete body.productId;
                delete body.isSent;
                // delete body.comment;
                delete body.monsantoProductReduceTransferInfo;

                console.log('helllo if');
                await customerMonsantoProduct.update({
                  lineNumber: details[i].lineNumber,
                  lineItemNumber: details[i].productBookingLineItemNumber,
                  unit: details[i].quantity.unit,
                  monsantoOrderQty: parseFloat(customerMonsantoProduct.dataValues.orderQty, 10),
                  unit: details[i].quantity.unit,
                  isSent: true,
                  isDeleted: isDeleted,
                  ...body,
                });
                productToReturn = { ...customerMonsantoProduct.dataValues };
              } else if (
                // monsantoProductReduceTransferInfo.growerInfo.lineItemNumber !== null &&
                // monsantoProductReduceTransferInfo.growerInfo.lineItemNumber !== 'newline' &&
                orderNumberList[i] == TocustomerPurchaseOrderId
              ) {
                CustomerMonsantoProduct.update(
                  {
                    lineNumber: details[i].lineNumber,
                    lineItemNumber: details[i].productBookingLineItemNumber,
                    unit: details[i].quantity.unit,
                    monsantoOrderQty: details[i].quantity.value,
                    unit: details[i].quantity.unit,
                    isSent: true,
                    isDeleted: isDeleted,
                  },
                  {
                    where: {
                      purchaseOrderId: TocustomerPurchaseOrderId,
                      monsantoProductId: monsantoProductId,
                      lineItemNumber: monsantoProductReduceTransferInfo.growerInfo.lineItemNumber,
                    },
                  },
                );
              }

              await PurchaseOrder.update(
                { salesOrderReference: crossRefIdentifier },
                { where: { id: orderNumberList[i] } },
              );
            }
            if (tocustomerInfo.lineItemNumber && tocustomerInfo.lineItemNumber !== 'newline') {
              await CustomerMonsantoProduct.findOne({
                where: {
                  purchaseOrderId: tocustomerInfo.purchaseOrderId,
                  lineItemNumber: tocustomerInfo.lineItemNumber,

                  monsantoProductId: monsantoProductId,
                },
              })
                .then((res) => {
                  res !== null &&
                    res.update({
                      orderQty:
                        parseFloat(res.dataValues.orderQty) +
                        parseFloat(monsantoProductReduceTransferInfo.reduceQuantity),
                      monsantoOrderQty:
                        parseFloat(res.dataValues.orderQty) +
                        parseFloat(monsantoProductReduceTransferInfo.reduceQuantity),
                    });
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          }
          if ((Object && Object.keys(productToReturn) === 0) || !productToReturn) {
            transferLog({
              req,
              productName: monsantoProduct.dataValues.productDetail,
              action: {
                AddedNewRow: `Grower to grower Transfer With beforeQuantity- ${parseFloat(
                  res.dataValues.orderQty,
                )} ,AfterQuantity[reduceQuantity]- ${parseFloat(
                  monsantoProductReduceTransferInfo.reduceQuantity,
                )} Quantity`,
              },
              otherDetail: {
                TransferStatus: `Bayer Transfer UnSuccesfull`,
                Error: 'Something went wrong',
              },
              purchaseOrderId: purchaseOrderId,
              productId: customerMonsantoProduct.dataValues.monsantoProductId,
              rowId: req.params.id,
            });
            throw new Error('Something went wrong');
          } else {
            if (properties[0].responseStatus === 'I' && properties[1].responseStatus === 'I') {
              msg = `${properties[0].responseStatus[`description`]} and ${properties[1].responseStatus[`description`]}`;
            }
            await DiscountReport.update({ isLoad: true }, { where: { purchaseOrderId: purchaseOrderId } });
            const tocustomerInfo = monsantoProductReduceTransferInfo.growerInfo;
            transferLog({
              req,
              productName: monsantoProduct.dataValues.productDetail,
              action: {
                FromUpdateRow: `FromCustomer Quantity ${parseFloat(
                  customerMonsantoProduct.dataValues.orderQty,
                )} ,reduceQuantity ${parseFloat(monsantoProductReduceTransferInfo.reduceQuantity)} Quantity`,

                ToCustomerRowUpdate: `ToCustomer Transfer Qunaity is ${reduceQuantity}`,
              },
              otherDetail: {
                TransferStatus: `Grower to Grower Transfer Succesfull`,
              },
              purchaseOrderId: purchaseOrderId,
              productId: customerMonsantoProduct.dataValues.monsantoProductId,
              rowId: req.params.id,
            });
            res.status(200).json({ msg: msg, data: productToReturn, impactSummary });
            console.log('i am from if');
          }
        } else {
          let body = req.body;
          delete body.packagingId;
          delete body.seedSizeId;
          delete body.productId;
          const tocustomerInfo = monsantoProductReduceTransferInfo.growerInfo;

          if (tocustomerInfo.lineItemNumber) {
            await CustomerMonsantoProduct.findOne({
              where: {
                purchaseOrderId: tocustomerInfo.purchaseOrderId,
                lineItemNumber: tocustomerInfo.lineItemNumber,
                monsantoProductId: monsantoProductId,
              },
            })
              .then((res) => {
                transferLog({
                  req,
                  productName: monsantoProduct.dataValues.productDetail,
                  action: {
                    UpdateRow: `Updated Row succesfully Befor Qty-${res.dataValues.orderQty} After Qty-${monsantoProductReduceTransferInfo.reduceQuantity}`,
                  },
                  otherDetail: {
                    Status: `Done`,
                  },
                  purchaseOrderId: tocustomerInfo.purchaseOrderId,
                  productId: monsantoProductId,
                  rowId: req.params.id,
                });
                res.update({
                  orderQty:
                    parseFloat(res.dataValues.orderQty) + parseFloat(monsantoProductReduceTransferInfo.reduceQuantity),
                });
              })
              .catch((e) => {
                console.log(e);
              });
          }

          // delete body.comment;
          delete body.monsantoProductReduceTransferInfo;
          await customerMonsantoProduct.update(body);
          await DiscountReport.update({ isLoad: true }, { where: { purchaseOrderId: purchaseOrderId } });

          res.status(200).json({
            msg: msg,
            data: customerMonsantoProduct,
          });
        }
      } else {
        let body = req.body;
        delete body.packagingId;
        delete body.seedSizeId;
        delete body.productId;

        console.log(monsantoProductId, 'monsantoProductId---', customerMonsantoProduct.dataValues.monsantoProductId);
        // delete body.comment;
        const tocustomerInfo = monsantoProductReduceTransferInfo && monsantoProductReduceTransferInfo.growerInfo;
        const monsantoProduct = await MonsantoProduct.findByPk(
          monsantoProductId || customerMonsantoProduct.dataValues.monsantoProductId,
        );

        if (tocustomerInfo && tocustomerInfo.lineItemNumber && tocustomerInfo.lineItemNumber !== null) {
          await CustomerMonsantoProduct.findOne({
            where: {
              purchaseOrderId: tocustomerInfo.purchaseOrderId,
              lineItemNumber: tocustomerInfo.lineItemNumber,

              monsantoProductId: monsantoProductId,
            },
          })
            .then(async (res) => {
              if (res) {
                const finalQty =
                  parseFloat(res.dataValues.orderQty) + parseFloat(monsantoProductReduceTransferInfo.reduceQuantity);
                transferLog({
                  req,
                  productName: monsantoProduct.dataValues.productDetail,
                  action: {
                    UpdateRow: `Updated Row succesfully Befor Qty-${res.dataValues.orderQty} After Qty-${finalQty}`,
                  },
                  otherDetail: {
                    Status: `Done`,
                  },
                  purchaseOrderId: tocustomerInfo.purchaseOrderId,
                  productId: monsantoProductId,
                  rowId: req.params.id,
                });

                res.update({
                  orderQty: finalQty,
                });
              }
            })
            .catch((e) => {
              console.log(e);
            });
        }
        await transferLog({
          req,
          productName: monsantoProduct.dataValues.productDetail,
          action: {
            UpdateRow: `Updated Row succesfully Befor Qty- ${orderQty} After Qty- ${req.body.orderQty}`,
          },
          otherDetail: {
            Status: `Done`,
          },
          purchaseOrderId: purchaseOrderId,
          productId: monsantoProductId,
          rowId: req.params.id,
        });
        delete body.monsantoProductReduceTransferInfo;
        const isExit = await CustomerMonsantoProduct.findOne({
          where: { id: req.params.id, isDeleted: false },
          raw: true,
        });

        const isProductChange = isExit !== null && isExit.monsantoProductId !== monsantoProductId;

        if (isProductChange) {
          let {
            productId,
            orderQty,
            discounts,
            farmId,
            fieldName,
            orderDate,
            price,

            comment,
            isSent,
          } = req.body;
          await customerMonsantoProduct.update({
            orderQty: 0,
            isSent: false,
            // isDeleted: true,
          });

          let lineNumber;
          let lineItemNumber;
          let currentOrders = await CustomerMonsantoProduct.findAll({
            where: {
              purchaseOrderId: purchaseOrderId,
              // monsantoProductId: productId,
              isDeleted: false,
            },
            attributes: ['lineItemNumber'],
            group: ['purchaseOrderId', 'lineItemNumber'],
            order: [[Sequelize.cast(Sequelize.col('lineItemNumber'), 'INTEGER'), 'DESC']],
            limit: 1,
          });
          if (!currentOrders || !currentOrders.length) {
            lineNumber = '999999';
            lineItemNumber = '1';
          } else {
            lineNumber = '999999';
            lineItemNumber = parseInt(currentOrders[0].lineItemNumber) + 1;
          }

          CustomerMonsantoProduct.create({
            purchaseOrderId: purchaseOrderId,
            farmId: isExit.farmId || req.body.farmId,
            organizationId: req.user.organizationId,
            monsantoProductId: monsantoProductId || isExit.monsantoProductId,
            orderQty: orderQty ? orderQty : isExit.orderQty,
            unit: unit,
            lineNumber,
            lineItemNumber,
            shareholderData: isExit.shareholderData || req.body.shareholderData,
            discounts: discounts ? discounts || [] : isExit.discounts || [],
            orderDate: isExit.orderDate,
            price: price ? price : isExit.price,
            comment: isExit.comment,
            fieldName: isExit.fieldName,
            monsantoOrderQty: isSent ? orderQty : null,
            isSent: isSent ? isSent : false,
            pickLaterQty: isExit.pickLaterQty,
          })
            .then((d) => {
              console.log('create succesfully');
            })
            .catch((e) => {
              console.log('errr at creating product', e);
            });
          console.log(' craete a new product and update the old product with o quantity');
        } else {
          const body = req.body;

          await customerMonsantoProduct.update({
            orderDate: req.body.orderDate,
            orderQty: req.body.orderQty,
            fieldName: req.body.fieldName ? req.body.fieldName : isExit.fieldName,
            pickLaterQty: req.body.pickLaterQty,
            discounts: req.body.discounts || [],
            comment: req.body.comment,
          });

          if (body.hasOwnProperty('isSent') && parseFloat(req.body.orderQty) !== parseFloat(isExit.monsantoOrderQty)) {
            await customerMonsantoProduct.update({
              isSent: req.body.isSent ? req.body.isSent : false,
            });
          }
        }
        const poId = req.body.FromCustomerdetail && req.body.FromCustomerdetail.purchaseOrderId;

        await DiscountReport.update({ isLoad: true }, { where: { purchaseOrderId: purchaseOrderId || poId } });

        res.status(200).json({ msg: msg, data: customerMonsantoProduct });
      }
    }
  } catch (error) {
    const customerMonsantoProduct = await CustomerMonsantoProduct.findByPk(req.params.id);
    const monsantoProduct = await MonsantoProduct.findByPk(
      monsantoProductId || customerMonsantoProduct.dataValues.monsantoProductId,
    );
    console.log(error, 'error');
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      const errorString = parseMainProductBookingError(errorXmL);
      await customerMonsantoProduct.update({
        orderDate: req.body.orderDate,
        orderQty: req.body.orderQty,
        isSent: false,
      });
      transferLog({
        req,
        productName: monsantoProduct.dataValues.productDetail,
        action: {
          UpdateProduct: ` grower to grower Transfer With Quantity ${parseFloat(
            customerMonsantoProduct.dataValues.orderQty,
          )} `,
        },
        otherDetail: {
          TransferStatus: `Bayer Transfer UnSuccesfull`,
          Error: errorString || 'something wrong with the api for now!',
        },
        purchaseOrderId: customerMonsantoProduct.dataValues.purchaseOrderId,
        productId: customerMonsantoProduct.dataValues.monsantoProductId,
        rowId: req.params.id,
      });
      return res.status(503).json({ error: errorString || 'something wrong with the api for now!' });
    } else {
      transferLog({
        req,
        productName: monsantoProduct.dataValues.productDetail,
        action: {
          UpdateProduct: ` grower to grower Transfer With Quantity ${parseFloat(
            customerMonsantoProduct.dataValues.orderQty,
          )} `,
        },
        otherDetail: {
          TransferStatus: `Bayer Transfer UnSuccesfull`,
          Error: `Error updating : ${error}` || 'something Went wrong with the api for now!',
        },
        purchaseOrderId: customerMonsantoProduct.dataValues.purchaseOrderId,
        productId: customerMonsantoProduct.dataValues.monsantoProductId,
        rowId: req.params.id,
      });
      return res
        .status(500)
        .json({ error: `Error updating : ${error}` || 'something Went wrong with the api for now!' });
    }
  }
};

module.exports.delete = async (req, res) => {
  let customerProductId = req.params.id;
  const { seedDealerMonsantoId, seedCompanyId, organizationName } = req.body;

  const customer = await Customer.findOne({
    where: {
      monsantoTechnologyId: seedDealerMonsantoId,
      isArchive: false,
    },
  });

  const organization = await Organization.findById(req.user.organizationId);
  // const organizationAddress = organization.dataValues.address;
  // const organizationBusinessCity = organization.dataValues.businessCity;
  // const organizationBusinessState = organization.dataValues.businessState;
  // const organizationBusinessZip = organization.dataValues.businessZip;

  // let x = new Date().toISOString().split('Z');
  // let x1 = x[0].split('.');
  // let x2 = x1[0] + '-05:00';

  CustomerMonsantoProduct.findOne({
    where: {
      organizationId: req.user.organizationId,
      id: customerProductId,
      // isSent: true
    },
    include: [
      {
        model: MonsantoProduct,
        include: [{ model: MonsantoProductLineItem, as: 'LineItem' }],
      },
    ],
  })
    .then(async (customerProduct) => {
      // console.log(customerProduct.dataValues.MonsantoProduct.dataValues.classification, 'customerProduct');

      if (customerProduct.dataValues.MonsantoProduct.dataValues.classification == 'P') {
        customerProduct.update({ orderQty: 0, isSent: false, isDeleted: true });
      } else {
        // const monsantoUserData = await ApiSeedCompany.findOne({
        //   where: { organizationId: req.user.organizationId }
        // });
        // const monsantoRequest = {
        //   orders: [
        //     {
        //       orderType: "Changed",
        //       orderNumber: customerProduct.dataValues.purchaseOrderId,
        //       productYear: calculateSeedYear(),
        //       directShip: 0,
        //       issuedDate: x2,
        //       shipTo: {
        //         name:
        //           customer.dataValues.organizationName ||
        //           customer.dataValues.name,
        //         identifier: customer.dataValues.glnId,
        //         agency: "GLN",
        //         addressInformation: {
        //           city: customer.dataValues.businessCity || "",
        //           state: customer.dataValues.businessState || "NE",
        //           postalCode: customer.dataValues.businessZip || "10000",
        //           postalCountry: "US",
        //           address:
        //             customer.dataValues.deliveryAddress || ""
        //         }
        //       },
        //       orderReference: customerProduct.dataValues.salesOrderReference,
        //       products: [
        //         {
        //           lineNumber: customerProduct.dataValues.lineNumber || "999999",
        //           lineItemNumber: customerProduct.dataValues.lineItemNumber,
        //           action: "Delete",
        //           requestedDate:
        //             customer.dataValues.requestedDate ||
        //             x2,
        //           crossReferenceProductId:
        //             customerProduct.dataValues.MonsantoProduct.crossReferenceId,
        //           increaseOrDecrease: {
        //             type: "Decrease",
        //             unit: customerProduct.dataValues.unit,
        //             value: customerProduct.dataValues.orderQty
        //           },
        //           quantity: {
        //             value: 0,
        //             unit: customerProduct.dataValues.unit
        //           },
        //           orderQty: customerProduct.dataValues.orderQty,
        //           monsantoOrderQty: customerProduct.dataValues.monsantoOrderQty,
        //           requestedShipDate: new Date(
        //             +new Date() + 60 * 60 * 24 * 7
        //           ).toISOString(), // ASK sourabh
        //           isDeleted: customerProduct.dataValues.isDeleted,
        //           lineItem: customerProduct.dataValues.MonsantoProduct.LineItem
        //         }
        //       ],
        //       seedCompanyId
        //     }
        //   ],
        //   organizationName,
        //   seedDealerMonsantoId,
        //   res,
        //   isDealerBucket: customer.dataValues.name.includes(
        //     "Bayer Dealer Bucket"
        //   )
        //     ? true
        //     : false,
        //   monsantoUserData,
        //   organizationAddress,
        //   organizationBusinessCity,
        //   organizationBusinessState,
        //   organizationBusinessZip,
        // };
        // const xmlStringRequest = await makeProductBookingRequest(
        //   monsantoRequest
        // );
        // const response = await request.post(config.monsantoEndPoint, {
        //   "content-type": "text/plain",
        //   body: xmlStringRequest
        // });
        // const responseString = await parseXmlStringPromise(response);
        // const monsantoResponse = await parseProductBookingResponse(
        //   responseString
        // );
        // if (monsantoResponse) {
        //   monsantoReqLogCreator({
        //     req,
        //     userName:customer.dataValues.name+"("+customer.dataValues.id+")",
        //     type: "product booking delete",
        //     uuid: monsantoResponse.uuid,
        //   });
        // }
        // const { properties } = monsantoResponse;
        // if (properties[`responseStatus`] === "E") {
        //   throw new Error(`${properties.responseStatus[`description`]}`);
        // } else {
        //   customerProduct.update({ orderQty: 0, isDeleted: true });
        // }
        if (customerProduct.dataValues.monsantoOrderQty <= 0) {
          if (customerProduct.dataValues.monsantoOrderQty == null) {
            customerProduct.update({ orderQty: 0, isDeleted: true, isSent: true });
          } else {
            customerProduct.update({ orderQty: 0, isDeleted: true });
          }
        } else {
          customerProduct.update({ orderQty: 0, isSent: false });
        }
        DiscountReport.update(
          { isLoad: true },
          { where: { purchaseOrderId: customerProduct.dataValues.purchaseOrderId } },
        );
      }

      // if (customerProduct.dataValues.monsantoOrderQty <= 0) {
      //   customerProduct.update({ orderQty: 0, isDeleted: true });
      // } else {
      //   customerProduct.update({ orderQty: 0, isSent: false });
      // }
      // DiscountReport.update(
      //   { isLoad: true },
      //   { where: { purchaseOrderId: customerProduct.dataValues.purchaseOrderId } },
      // );
    })
    .then(async () => {
      const customerProduct = await CustomerMonsantoProduct.findOne({
        where: {
          organizationId: req.user.organizationId,
          id: customerProductId,
          // isSent: true
        },
      });
      const monsantoProduct = await MonsantoProduct.findById(customerProduct.dataValues.monsantoProductId);

      transferLog({
        req,
        productName: monsantoProduct.dataValues.productDetail,
        action: { DeletedRow: 'Deleted record successfully' },
        otherDetail: {
          Staus: 'Done',
        },
        purchaseOrderId: customerProduct.dataValues.purchaseOrderId,
        productId: customerProduct.dataValues.monsantoProductId,
        rowId: customerProductId,
      });

      res.json({ ok: 'ok' });
    })
    .catch((e) => {
      console.log('error...: ', e);
      res.status(422).json({ error: 'Error deleting customer MonsantoProduct product' });
    });
};

async function makeProductBookingRequest(monsantoRequest, monsantoUserData) {
  const {
    orders,
    organizationName,
    seedDealerMonsantoId,
    res,
    isDealerBucket,
    organizationAddress,
    organizationBusinessCity,
    organizationBusinessState,
    organizationBusinessZip,
  } = monsantoRequest;
  try {
    const xmlStrinRgequest = await buildProductBookingRequest({
      seedDealerMonsantoId,
      organizationName,
      orders,
      isDealerBucket,
      monsantoUserData,
      organizationAddress,
      organizationBusinessCity,
      organizationBusinessState,
      organizationBusinessZip,
    });
    return xmlStrinRgequest;
  } catch (e) {
    console.log('<>><>>:-----> ', e);
  }
}

module.exports.getLastUpdate = (req, res) => {
  CustomerMonsantoProduct.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"CustomerMonsantoProduct"."updatedAt" DESC'),
    limit: 1,
  })
    .then((customerProducts) => {
      let lastUpdate = (customerProducts[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
};

module.exports.transferPo = async (req, res) => {
  try {
    const { fromPurchaseOrderId, fromCustomerId, toPurchaseOrderId, toCustomerId, organizationId } = req.body;
    const syncMonsantoProductIds = [];
    const fromProducts = await CustomerMonsantoProduct.findAll({
      where: { purchaseOrderId: fromPurchaseOrderId, isDeleted: false },
    });
    let lineNumber;
    let lineItemNumber;
    let msg = 'Transfer Successfully';
    let currentOrders = await CustomerMonsantoProduct.findAll({
      where: {
        purchaseOrderId: toPurchaseOrderId,
        // monsantoProductId: productId,
        // isDeleted: false
      },
      attributes: ['lineItemNumber'],
      group: ['purchaseOrderId', 'lineItemNumber'],
      order: [['lineItemNumber', 'DESC']],
      limit: 1,
    });
    if (!currentOrders || !currentOrders.length) {
      lineNumber = '999999';
      lineItemNumber = '1';
    } else {
      lineNumber = '999999';
      lineItemNumber = parseInt(currentOrders[0].lineItemNumber) + 1;
    }
    Promise.all(
      fromProducts.map(async (product) => {
        const checkExistance = await CustomerMonsantoProduct.findAll({
          where: {
            purchaseOrderId: toPurchaseOrderId,
            monsantoProductId: product.dataValues.monsantoProductId,
            isDeleted: false,
          },
        });

        if (checkExistance.length > 0) {
          CustomerMonsantoProduct.findAll({
            where: { id: checkExistance[0].dataValues.id },
          }).then(function (monsantoProduct) {
            // Check if record exists in db
            const orderQty =
              parseFloat(monsantoProduct[0].dataValues.orderQty) + parseFloat(product.dataValues.orderQty);
            if (monsantoProduct) {
              monsantoProduct[0]
                .update({ orderQty: orderQty, isSent: false })
                .then(() => {
                  console.log('updated');
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          });
        } else {
          CustomerMonsantoProduct.create({
            purchaseOrderId: toPurchaseOrderId,
            farmId: product.dataValues.farmId ? product.dataValues.farmId : null,
            organizationId: organizationId,
            monsantoProductId: product.dataValues.monsantoProductId,
            orderQty: product.dataValues.orderQty,
            unit: product.dataValues.unit,
            lineNumber: lineNumber,
            lineItemNumber: lineItemNumber,
            discounts: product.dataValues.discounts,
            orderDate: product.dataValues.orderDate,
            price: product.dataValues.price,
          })
            .then((customerProduct) => console.log('created'))
            .catch((e) => {
              console.log(e);
            });
        }
        lineItemNumber = parseInt(lineItemNumber) + 1;
      }),
    );

    const apiSeedCompany = await ApiSeedCompany.findOne({
      where: {
        organizationId: organizationId,
        isDeleted: false,
      },
    });

    const seedCompanyId = apiSeedCompany.dataValues.id;
    const seedDealerMonsantoId = apiSeedCompany.dataValues.technologyId;

    const monsantoUserData = await ApiSeedCompany.findOne({
      where: { organizationId: req.user.organizationId },
    });

    const organization = await Organization.findById(req.user.organizationId);
    const organizationName = organization.dataValues.name;
    const organizationAddress = organization.dataValues.address;
    const organizationBusinessCity = organization.dataValues.businessCity;
    const organizationBusinessState = organization.dataValues.businessState;
    const organizationBusinessZip = organization.dataValues.businessZip;
    let x = new Date().toISOString().split('Z');
    let x1 = x[0].split('.');
    let x2 = x1[0] + '-05:00';

    const FromCustomer = await Customer.findOne({
      where: {
        id: fromCustomerId,
        isArchive: false,
      },
    });

    const toCustomer = await Customer.findOne({
      where: {
        id: toCustomerId,
        isArchive: false,
      },
    });
    // const TocustomerPurchaseOrderId = monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId;

    const toCustomerOrders = await CustomerMonsantoProduct.all({
      where: {
        purchaseOrderId: toPurchaseOrderId,
        // monsantoProductId: monsantoProductId,
      },
      include: [
        {
          model: MonsantoProduct,
          include: [{ model: MonsantoProductLineItem, as: 'LineItem' }],
        },
        {
          model: PurchaseOrder,
          as: 'PurchaseOrder',
        },
      ],
    });

    const fromCustomerOrders = await CustomerMonsantoProduct.all({
      where: {
        purchaseOrderId: fromPurchaseOrderId,
        // monsantoProductId: monsantoProductId,
      },
      include: [
        {
          model: MonsantoProduct,
          include: [{ model: MonsantoProductLineItem, as: 'LineItem' }],
        },
        {
          model: PurchaseOrder,
          as: 'PurchaseOrder',
        },
      ],
    });

    const isToSalesOrderReference = toCustomerOrders[0].dataValues.PurchaseOrder
      ? toCustomerOrders[0].dataValues.PurchaseOrder.dataValues.salesOrderReference
      : false;
    const isFromSalesOrderReference = fromCustomerOrders[0].dataValues.PurchaseOrder
      ? fromCustomerOrders[0].dataValues.PurchaseOrder.dataValues.salesOrderReference
      : false;

    const getFromCustomerProducts = () => {
      return fromCustomerOrders
        .filter((order) => order.orderQty > 0 && order.isDeleted == false)
        .map((order) => {
          const increaseOrDecrease = {
            type: 'Decrease',
            unit: order.unit,
          };
          const value = order.orderQty;
          increaseOrDecrease.value = Math.abs(value);
          const qtyValue = 0;
          return {
            lineNumber: order.lineNumber || '999999',
            lineItemNumber: order.lineItemNumber,
            action: qtyValue == 0 ? 'Delete' : qtyValue > 0 ? 'Change' : 'Add',
            requestedDate: order.requestedDate || x2,
            crossReferenceProductId: order.MonsantoProduct.crossReferenceId,
            increaseOrDecrease,
            quantity: {
              value: qtyValue,
              unit: order.unit,
            },
            orderQty: 0,
            monsantoOrderQty: order.monsantoOrderQty,
            requestedShipDate: x2, // ASK sourabh
            isDeleted: order.isDeleted,
            lineItem: order.MonsantoProduct.LineItem,
            // "specialInstructions": {
            // "type": "General",
            //   "content": "Plant Early"
            // }//Optional,
          };
        });
    };

    const getToCustomerProducts = () => {
      return toCustomerOrders
        .filter((order) => order.orderQty > 0 && order.isDeleted == false)
        .map((order) => {
          const increaseOrDecrease = {
            type: 'Increase',
            unit: order.unit,
          };
          let productAction = 'Add';
          if (order.monsantoOrderQty === undefined || order.monsantoOrderQty === null) {
            increaseOrDecrease.value = order.orderQty;
          } else if (order.orderQty == 0) {
            productAction = 'Delete';
          } else {
            productAction = 'Change';
            const diff = order.monsantoOrderQty - order.orderQty;
            increaseOrDecrease.value = Math.abs(diff);
          }

          return {
            lineNumber: order.lineNumber || '999999',
            lineItemNumber: order.lineItemNumber,
            action: productAction,
            requestedDate: order.requestedDate || x2,
            crossReferenceProductId: order.MonsantoProduct.crossReferenceId,
            increaseOrDecrease,
            quantity: {
              value: order.orderQty,
              unit: order.unit,
            },
            orderQty: order.orderQty,
            monsantoOrderQty: order.monsantoOrderQty,
            requestedShipDate: x2, // ASK sourabh
            isDeleted: order.isDeleted,
            lineItem: order.MonsantoProduct.LineItem,
            // "specialInstructions": {
            // "type": "General",
            //   "content": "Plant Early"
            // }//Optional,
          };
        });
    };

    const monsantoRequest = {
      orders: [
        {
          orderType: 'Cancelled',
          orderNumber: fromPurchaseOrderId,
          productYear: calculateSeedYear(),
          directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
          issuedDate: x2,
          orderReference: isFromSalesOrderReference,
          // specialInstructions: {
          //   type: "MarkingInstructions",
          //   content: "West Farm"
          // }, // TODO: commented until we discuss or support this on the UI
          shipTo: {
            name: FromCustomer.organizationName || FromCustomer.name, //TODO discusss if organization name should be mandatory
            identifier:
              FromCustomer.name == 'Bayer Dealer Bucket'
                ? '1100064726737'
                : FromCustomer.glnId !== null
                ? FromCustomer.glnId
                : FromCustomer.monsantoTechnologyId,
            agency:
              FromCustomer.name == 'Bayer Dealer Bucket'
                ? 'GLN'
                : FromCustomer.glnId !== null
                ? 'GLN'
                : 'AssignedBySeller',
            addressInformation: {
              city: FromCustomer.businessCity || '',
              state: FromCustomer.businessState || 'NE',
              postalCode: FromCustomer.businessZip || '10000',
              postalCountry: 'US', //TODO: ask sourabh
              address: FromCustomer.deliveryAddress || '',
            },
          },
          products: getFromCustomerProducts(),
          seedCompanyId,
        },
        {
          orderType: isToSalesOrderReference ? 'Changed' : 'New',
          orderNumber: toPurchaseOrderId,
          productYear: calculateSeedYear(),
          directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
          issuedDate: x2,
          orderReference: isToSalesOrderReference,
          // specialInstructions: {
          //   type: "MarkingInstructions",
          //   content: "West Farm"
          // }, // TODO: commented until we discuss or support this on the UI
          shipTo: {
            name: toCustomer.organizationName || toCustomer.name, //TODO discusss if organization name should be mandatory
            identifier:
              toCustomer.name == 'Bayer Dealer Bucket'
                ? '1100064726737'
                : toCustomer.glnId !== null
                ? toCustomer.glnId
                : toCustomer.monsantoTechnologyId,
            agency:
              toCustomer.name == 'Bayer Dealer Bucket' ? 'GLN' : toCustomer.glnId !== null ? 'GLN' : 'AssignedBySeller',
            addressInformation: {
              city: toCustomer.businessCity || '',
              state: toCustomer.businessState || 'NE',
              postalCode: toCustomer.businessZip || '10000',
              postalCountry: 'US', //TODO: ask sourabh
              address: toCustomer.deliveryAddress || '',
            },
          },
          products: getToCustomerProducts(),
          seedCompanyId,
        },
      ],
      organizationName,
      seedDealerMonsantoId,
      organizationAddress,
      organizationBusinessCity,
      organizationBusinessState,
      organizationBusinessZip,
      // res
    };

    const xmlStringRequest = await makeProductBookingRequest(monsantoRequest, monsantoUserData);
    const response = await request.post(config.monsantoEndPoint, {
      'content-type': 'text/plain',
      body: xmlStringRequest,
    });
    const responseString = await parseXmlStringPromise(response);
    const hardCodeResponse = await parseXmlStringPromise(hardCodeXml);
    const rawResponseData = bayerAPIDown === 'true' ? hardCodeResponse : responseString;

    const monsantoResponse = await parseProductBookingResponse(rawResponseData);
    const { properties, details } = monsantoResponse;
    const { errorMsg, warningMsg, isError } = parseProductBookingError(properties.responseStatus, details);

    if (warningMsg) msg = warningMsg;
    if (isError) {
      monsantoReqLogCreator({
        req,
        userName: FromCustomer.name + '(' + fromCustomerId + ')',
        type: 'product booking(changed)',
        uuid: monsantoResponse.uuid,
        description: JSON.stringify(properties.responseStatus),
      });
      const toCustomerProducts = await CustomerMonsantoProduct.findAll({
        purchaseOrderId: toPurchaseOrderId,
        // monsantoProductId: monsantoProductId,
        isDeleted: false,
      });
      toCustomerProducts.map(async (toCustomerProduct) => {
        if (
          toCustomerProduct.dataValues.orderQty -
            (parseFloat(toCustomerProduct.dataValues.orderQty) -
              parseFloat(toCustomerProduct.dataValues.monsantoOrderQty)) >
          0
        ) {
          // we will update created product
          await toCustomerProduct.update({
            orderQty:
              toCustomerProduct.dataValues.orderQty -
              (parseFloat(toCustomerProduct.dataValues.orderQty) -
                parseFloat(toCustomerProduct.dataValues.monsantoOrderQty)),
          });
        } else {
          // we have to delete that product
          await CustomerMonsantoProduct.destroy({
            where: {
              purchaseOrderId: toPurchaseOrderId,
              // monsantoProductId: monsantoProductId,
              isDeleted: false,
            },
          });
        }
      });

      throw new Error(errorMsg);
    } else {
      const orderNumberList = [];
      Object.keys(properties).map((item) =>
        orderNumberList.push({
          purchaseorder: properties[item].orderNumber,
          crossRefIdentifier: properties[item].crossRefIdentifier,
        }),
      );

      for (let j = 0; j < orderNumberList.length; j++) {
        for (let i = 0; i < details.length; i++) {
          const isDeleted = parseFloat(details[i].quantity.value, 10) === 0 ? true : false;
          const productBookingLineItemNumber = parseInt(details[i].productBookingLineItemNumber);
          if (toPurchaseOrderId == orderNumberList[j].purchaseorder && parseFloat(details[i].quantity.value, 10) > 0) {
            const customerProduct = await CustomerMonsantoProduct.update(
              {
                lineNumber: details[i].lineNumber,
                lineItemNumber: details[i].productBookingLineItemNumber,
                unit: details[i].quantity.unit,
                monsantoOrderQty: parseFloat(details[i].quantity.value, 10),
                unit: details[i].quantity.unit,
                isSent: true,
                isDeleted: fromPurchaseOrderId == orderNumberList[j].purchaseorder ? true : false,
              },
              {
                where: {
                  purchaseOrderId: orderNumberList[j].purchaseorder,
                  lineItemNumber: String(productBookingLineItemNumber),
                  isDeleted: false,
                },
              },
            );
          } else {
            const customerProduct1 = await CustomerMonsantoProduct.update(
              {
                lineNumber: details[i].lineNumber,
                lineItemNumber: details[i].productBookingLineItemNumber,
                unit: details[i].quantity.unit,
                monsantoOrderQty: parseFloat(details[i].quantity.value, 10),
                unit: details[i].quantity.unit,
                isSent: true,
                isDeleted: fromPurchaseOrderId == orderNumberList[j].purchaseorder ? true : false,
              },
              {
                where: {
                  purchaseOrderId: orderNumberList[j].purchaseorder,
                  lineItemNumber: String(details[i].productBookingLineItemNumber),
                  isDeleted: false,
                },
              },
            );
          }
        }
        await PurchaseOrder.update(
          { salesOrderReference: orderNumberList[j].crossRefIdentifier },
          { where: { id: orderNumberList[j].purchaseorder } },
        );
      }

      PurchaseOrder.findOne({
        where: {
          id: fromPurchaseOrderId,
        },
      }).then((purchaseOrder) => {
        purchaseOrder.update({ isDeleted: true });
      });
    }
    res.status(200).json({ msg: msg });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

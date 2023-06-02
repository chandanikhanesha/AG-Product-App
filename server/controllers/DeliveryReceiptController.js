const request = require('request-promise');
const config = require('config').getConfig();
const { Router } = require('express');
const Sequelize = require('sequelize');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { create: actionLogCreator } = require('../middleware/actionLogCreator');
const { parseProductBookingError, calculateSeedYear, parseShipNoticeError } = require('../utilities/xml/common');
const { Op } = require('sequelize');

const {
  productMovementReport: { buildproductMovementReportRequest },
  productBooking: { buildProductBookingRequest, parseProductBookingResponse },
  common: { parseXmlStringPromise },
} = require('utilities/xml');
const {
  ApiSeedCompany,
  DeliveryReceipt,
  DeliveryReceiptDetails,
  Product,
  Lot,
  MonsantoLot,
  MonsantoProduct,
  CustomLot,
  CustomProduct,
  Organization,
  Customer,
  PurchaseOrder,
  CustomerMonsantoProduct,
  MonsantoProductLineItem,
} = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router({ mergeParams: true }));

router.get('/', (req, res) => {
  const condition =
    req.params.purchase_order_id !== 'purchase_order_id'
      ? {
          organizationId: req.user.organizationId,
          purchaseOrderId: req.params.purchase_order_id,
          isDeleted: false,
        }
      : {
          organizationId: req.user.organizationId,
          isDeleted: false,
        };

  DeliveryReceipt.findAll({
    where: condition,
    include: [
      {
        model: DeliveryReceiptDetails,
        where: {
          isDeleted: false,
        },
        attributes: [
          'id',
          'amountDelivered',
          'deliveryReceiptId',
          'lotId',
          'monsantoLotId',
          'customProductId',
          'monsantoProductId',
          'productId',
          'createdAt',
          'isDeleted',
          'customLotId',
          'customerMonsantoProductId',
          'crossReferenceId',
        ],
        include: [
          {
            model: Lot,
            attributes: ['id', 'lotNumber'],
            include: [
              {
                model: Product,
              },
            ],
          },
          {
            model: CustomLot,
            attributes: ['id', 'lotNumber'],
            include: [
              {
                model: CustomProduct,
              },
            ],
          },
          {
            model: MonsantoLot,
            include: [
              {
                model: MonsantoProduct,
                as: 'Product',
              },
            ],
          },
        ],
      },
    ],
  })
    .then((deliveryReceipts) => {
      const receipts = deliveryReceipts.sort((a, b) => a.createdAt - b.createdAt);
      receipts.forEach((receipt) => {
        receipt.dataValues.DeliveryReceiptDetails = receipt.dataValues.DeliveryReceiptDetails.filter(
          (drd) => !drd.isDeleted,
        );
      });
      return res.json(filterDeletedListResponse(receipts));
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error fetching delivery receipts' });
    });
});

router.post('/', accessControlMiddleware.check('create', 'delivery'), (req, res) => {
  let dr;
  const purchaseOrderId = req.params.purchase_order_id;
  const data = req.body;
  DeliveryReceipt.create({
    purchaseOrderId: purchaseOrderId,
    organizationId: req.user.organizationId,
    name: data.name,
    deliveredBy: data.deliveredBy,
    deliveredAt: data.deliveredAt,
    isReturn: data.isReturnChecked,
    isDeleted: false,
  })
    .then((deliveryReceipt) => {
      dr = deliveryReceipt;
      return Promise.all(
        data.updatedDeliveries.map(async (deliveryData) => {
          let lastItemNumber = await DeliveryReceiptDetails.findAll({
            where: {
              purchaseOrderId: purchaseOrderId,
            },
            attributes: ['lineItemNumber'],
            group: ['purchaseOrderId', 'lineItemNumber'],
            order: [['lineItemNumber', 'DESC']],
            limit: 1,
          });

          let purchaseOrderCreated;
          let lineItemNumber;
          let lineNumber;
          let returnValue = data.isReturnChecked ? '_R' : '_D';
          if (deliveryData.monsantoProductId) {
            const cmp = await CustomerMonsantoProduct.findOne({
              where: {
                id: deliveryData.customerProductId,
              },
            });
            lineNumber = cmp.dataValues.lineNumber;
          } else {
            lineNumber = 0;
          }
          if (!lastItemNumber || !lastItemNumber.length) {
            lineItemNumber = '1';
            purchaseOrderCreated = purchaseOrderId + returnValue + lineNumber + '-' + lineItemNumber; // if it is return _R otherwise _D
          } else {
            let currentdeliveryData = await DeliveryReceiptDetails.findAll({
              where: {
                purchaseOrderId: purchaseOrderId,
                monsantoProductId: deliveryData.monsantoProductId,
              },
              attributes: ['lineItemNumber'],
              group: ['purchaseOrderId', 'lineItemNumber'],
              order: [['lineItemNumber', 'DESC']],
              limit: 1,
            });
            if (!currentdeliveryData || !currentdeliveryData.length) {
              lineItemNumber = parseInt(lastItemNumber[0].dataValues.lineItemNumber) + 1;
              purchaseOrderCreated = purchaseOrderId + returnValue + lineNumber + '-' + '1';
            } else {
              let currentdeliveryDataCount = await DeliveryReceiptDetails.findAll({
                where: {
                  purchaseOrderId: purchaseOrderId,
                  monsantoProductId: deliveryData.monsantoProductId,
                },
                attributes: ['lineNumber', 'lineItemNumber'],
              });
              lineItemNumber = parseInt(currentdeliveryData[0].dataValues.lineItemNumber);
              purchaseOrderCreated =
                purchaseOrderId + returnValue + lineNumber + '-' + parseInt(currentdeliveryDataCount.length + 1);
            }
          }

          await DeliveryReceiptDetails.create({
            purchaseOrderId: purchaseOrderId,
            lineItemNumber,
            lineNumber,
            purchaseOrderCreated,
            deliveryReceiptId: dr.id,
            amountDelivered: deliveryData.amountDelivered,
            lotId: deliveryData.lotId,
            monsantoLotId: deliveryData.monsantoLotId,
            customProductId: deliveryData.customProductId,
            monsantoProductId: deliveryData.monsantoProductId,
            productId: deliveryData.productId,
            customLotId: deliveryData.customLotId,
            customerMonsantoProductId: deliveryData.customerMonsantoProductId,
            isDeleted: false,
            crossReferenceId: deliveryData.crossReferenceId,
          });
        }),
      );
    })
    .then(() =>
      DeliveryReceipt.findOne({
        where: { id: dr.id },
        include: [
          {
            model: DeliveryReceiptDetails,
            attributes: [
              'id',
              'amountDelivered',
              'deliveryReceiptId',
              'lotId',
              'createdAt',
              'customProductId',
              'isDeleted',
              'monsantoLotId',
              'monsantoProductId',
              'lineNumber',
              'lineItemNumber',
              'purchaseOrderCreated',
              'customerMonsantoProductId',
            ],
          },
        ],
      }),
    )
    .then(async (deliveryReceipt) => {
      actionLogCreator({
        req,
        operation: 'create',
        type: 'delivery',
        typeId: dr.id,
        previousData: {},
        changedData: req.body,
      });
      console.log('all done of creating recepit');

      let isMonsanto;
      data.updatedDeliveries.filter((deliveryData) => {
        if (deliveryData.monsantoProductId !== null) {
          isMonsanto = true;
        } else {
          isMonsanto = false;
        }
      });
      console.log(isMonsanto, 'isMonsanto');

      if (isMonsanto) {
        const monsantoUserData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });
        const po = await PurchaseOrder.findById(req.params.purchase_order_id);

        const customerData = await Customer.findOne({ where: { id: po.dataValues.customerId, isArchive: false } });

        const organization = await Organization.findById(req.user.organizationId);

        const productTransactions = await Promise.all(
          deliveryReceipt.dataValues.DeliveryReceiptDetails.map(async (record) => {
            let ProductLineItems = [];
            const productName = await MonsantoProduct.findOne({
              where: {
                id: record.monsantoProductId,
                classification: {
                  [Op.not]: 'P',
                },
                organizationId: req.user.organizationId,
              },
              include: [
                { model: MonsantoProductLineItem, as: 'LineItem', attributes: ['suggestedDealerMeasurementUnitCode'] },
              ],
            });
            if (productName) {
              ProductLineItems = [
                {
                  ProductName: productName.dataValues.productDetail,
                  productId: productName.dataValues.crossReferenceId,
                  ProductQuantity: {
                    MeasurementValue: record.amountDelivered,
                    Domain: JSON.parse(productName.LineItem.suggestedDealerMeasurementUnitCode).domain,
                    text: JSON.parse(productName.LineItem.suggestedDealerMeasurementUnitCode).value,
                  },
                  LineNumber: record.lineNumber,
                },
              ];
            } else {
              DeliveryReceipt.update(
                { isSynce: true },
                {
                  where: {
                    purchaseOrderId: req.params.purchase_order_id,
                    isSynce: false,
                    id: dr.id,
                  },
                },
              );
            }

            const InvoiceNumber = record.purchaseOrderCreated;
            return { ProductLineItems, InvoiceNumber };
          }),
        );

        const helper = {};
        const productTransactions2 = [];

        if (productTransactions[0].ProductLineItems.length > 0) {
          const arr2 = productTransactions.reduce(function (r2, o2) {
            const key = o2.ProductLineItems[0].productId;
            if (!helper[key]) {
              helper[key] = Object.assign({}, o2); // create a copy of o
              productTransactions2.push(helper[key]);
            } else {
              helper[key].ProductLineItems[0].ProductQuantity = {
                ...helper[key].ProductLineItems[0].ProductQuantity,
                MeasurementValue:
                  parseFloat(helper[key].ProductLineItems[0].ProductQuantity.MeasurementValue) +
                  parseFloat(o2.ProductLineItems[0].ProductQuantity.MeasurementValue),
              };
            }

            return r2;
          }, {});

          const isReturn = data.isReturnChecked;
          const xmlStringRequest = await buildproductMovementReportRequest({
            seedDealerMonsantoId: monsantoUserData.dataValues.glnId,
            organizationName: organization.dataValues.name,
            productTransactions: productTransactions2,
            monsantoUserData,
            customerData: customerData.dataValues,
            isReturn,
            invoiceDate: po.dataValues.createdAt,
          });
          request
            .post(config.monsantoEndPoint, {
              'content-type': 'text/plain',
              body: xmlStringRequest,
            })
            .then(async (response) => {
              console.log('i am then');
              const responseString = await parseXmlStringPromise(response);
              if (responseString) {
                DeliveryReceipt.update(
                  { isSynce: true },
                  {
                    where: {
                      purchaseOrderId: req.params.purchase_order_id,
                      isSynce: false,
                      id: dr.id,
                    },
                  },
                )
                  .then(() => console.log('creating recepit successfully'))
                  .catch(async (e) => {
                    // console.log('error : ', e);
                    if (e.response && e.response.body) {
                      const errorXmL = await parseXmlStringPromise(e.response.body);
                      const errorString = parseShipNoticeError(errorXmL);
                      return res.status(503).json({
                        error:
                          "The Delivery Receipt was added successfully to Agri-Dealer. However we weren't able to sync it with Bayer's API yet. This is the error message from Bayer and please try syncing this GPOS delivery later. {" +
                          errorString
                            ? errorString
                            : '' + '}.',
                      });
                    } else {
                      return res.status(503).json({
                        error: `Error at the deliveryReceipt ${e}`,
                      });
                    }

                    // return res.status(422).json({ error: 'Error updating deliverRecepiet ' });
                  });
              }
            })
            .then(async () => {
              if (data.isReturnChecked) {
                var totalQty = [];
                data.updatedDeliveries.reduce(function (res, value) {
                  const pID = value.customerMonsantoProductId;
                  if (!res[pID]) {
                    res[pID] = {
                      monsantoProductId: value.monsantoProductId,
                      amountDelivered: 0,
                      customerProductId: value.customerMonsantoProductId,
                    };
                    totalQty.push(res[pID]);
                  }
                  res[pID].amountDelivered += Number(value.amountDelivered);

                  return res;
                }, {});
                const apiSeedCompany = await ApiSeedCompany.findOne({
                  where: {
                    organizationId: req.user.organizationId,
                    isDeleted: false,
                  },
                });

                const CustomerOrders = await CustomerMonsantoProduct.all({
                  where: {
                    purchaseOrderId: req.params.purchase_order_id,
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

                const orderReferenceData =
                  CustomerOrders[0] && CustomerOrders[0].dataValues.PurchaseOrder
                    ? CustomerOrders[0].dataValues.PurchaseOrder.dataValues.salesOrderReference
                    : false;
                const monsantoProduct = await MonsantoProduct.findById(
                  CustomerOrders[0] && CustomerOrders[0].dataValues.monsantoProductId,
                );
                const seedCompanyId = monsantoProduct.dataValues.seedCompanyId;

                const organizationName = organization.dataValues.name;
                const organizationAddress = organization.dataValues.address;
                const organizationBusinessCity = organization.dataValues.businessCity;
                const organizationBusinessState = organization.dataValues.businessState;
                const organizationBusinessZip = organization.dataValues.businessZip;

                const seedDealerMonsantoId = apiSeedCompany.dataValues.technologyId;

                let x = new Date().toISOString().split('Z');
                let x1 = x[0].split('.');
                let x2 = x1[0] + '-05:00';
                const productdata = [];
                await Promise.all(
                  totalQty.map(async (item) => {
                    await CustomerMonsantoProduct.all({
                      where: {
                        purchaseOrderId: req.params.purchase_order_id,
                        id: item.customerProductId,
                        monsantoProductId: item.monsantoProductId,
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
                    }).then(async (CustomerOrders) => {
                      return await CustomerOrders.map((order) => {
                        const increaseOrDecrease = {
                          type: 'Decrease',
                          unit: order.unit,
                        };
                        const value = item.amountDelivered;
                        increaseOrDecrease.value = Math.abs(value);
                        const qtyValue = order.monsantoOrderQty - item.amountDelivered;
                        productdata.push({
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
                          orderQty: order.monsantoOrderQty - item.amountDelivered,
                          monsantoOrderQty: order.monsantoOrderQty,
                          requestedShipDate: x2, // ASK sourabh
                          isDeleted: order.isDeleted,
                          lineItem: order.MonsantoProduct.LineItem,
                        });
                      });
                    });
                  }),
                );

                const monsantoUserData = await ApiSeedCompany.findOne({
                  where: { organizationId: req.user.organizationId },
                });
                const xmlStringRequest = await buildProductBookingRequest({
                  seedDealerMonsantoId,
                  organizationName,
                  orders: [
                    {
                      orderReference: orderReferenceData,
                      orderType: 'Changed',
                      orderNumber: req.params.purchase_order_id,
                      productYear: calculateSeedYear(),
                      directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
                      issuedDate: x2,
                      shipTo: {
                        name: customerData.dataValues.organizationName || customerData.dataValues.name, //TODO discusss if organization name should be mandatory
                        identifier:
                          customerData.dataValues.name == 'Bayer Dealer Bucket'
                            ? '1100064726737'
                            : customerData.dataValues.glnId !== null
                            ? customerData.dataValues.glnId
                            : customerData.dataValues.monsantoTechnologyId,
                        agency:
                          customerData.dataValues.name == 'Bayer Dealer Bucket'
                            ? 'GLN'
                            : customerData.dataValues.glnId !== null
                            ? 'GLN'
                            : 'AssignedBySeller',
                        addressInformation: {
                          city: customerData.dataValues.businessCity || '',
                          state: customerData.dataValues.businessState || 'NE',
                          postalCode: customerData.dataValues.businessZip || '10000',
                          postalCountry: 'US', //TODO: ask sourabh
                          address: customerData.dataValues.deliveryAddress || '',
                        },
                      },
                      products: productdata,
                      seedCompanyId,
                    },
                  ],
                  // isDealerBucket,
                  monsantoUserData,
                  organizationAddress,
                  organizationBusinessCity,
                  organizationBusinessState,
                  organizationBusinessZip,
                });
                request
                  .post(config.monsantoEndPoint, {
                    'content-type': 'text/plain',
                    body: xmlStringRequest,
                  })
                  .then(async (response) => {
                    const responseString = await parseXmlStringPromise(response).then(() => {
                      totalQty.map(async (item) => {
                        await CustomerMonsantoProduct.all({
                          where: {
                            purchaseOrderId: req.params.purchase_order_id,
                            id: item.customerProductId,
                            monsantoProductId: item.monsantoProductId,
                          },
                        })
                          .then(async (CustomerOrders) => {
                            await CustomerOrders.map((order) => {
                              const qtyValue = order.orderQty - item.amountDelivered;
                              if (qtyValue > 0) {
                                CustomerMonsantoProduct.update(
                                  { orderQty: qtyValue },
                                  {
                                    where: {
                                      purchaseOrderId: req.params.purchase_order_id,
                                      id: item.customerProductId,
                                      monsantoProductId: item.monsantoProductId,
                                    },
                                  },
                                );
                              }
                            });
                          })
                          .catch((e) => {
                            return res.status(422).json({ error: 'Error updating customerProduct ' });
                          });
                      });
                    });

                    res.status(200).send({ success: responseString });
                  })
                  .catch(async (e) => {
                    if (e.response && e.response.body) {
                      const errorXmL = await parseXmlStringPromise(e.response.body);
                      const errorString = parseMainProductBookingError(errorXmL);
                      return res.status(503).json({
                        error: errorString,
                      });
                    } else {
                      return res.status(503).json({
                        error: `Error at delivery Receipt ${e}`,
                      });
                    }
                  });
              }
              res.status(200).json({ success: 'delivery create successfully' });
            })

            .catch(async (e) => {
              // console.log(e, 'error at delivery controller');
              if (e.response && e.response.body) {
                const errorXmL = await parseXmlStringPromise(e.response.body);
                const errorString = parseShipNoticeError(errorXmL);
                return res.status(503).json({
                  error:
                    "The Delivery Receipt was added successfully to Agri-Dealer. However we weren't able to sync it with Bayer's API yet. This is the error message from Bayer and please try syncing this GPOS delivery later. {" +
                    errorString
                      ? errorString
                      : '' + '}.',
                });
              } else {
                return res.status(503).json({
                  error: `Error at deliveryReceipt ${e}`,
                });
              }
            });
        } else {
          res.status(200).json({ success: 'delivery create successfully' });
        }
      } else {
        await DeliveryReceipt.findOne({
          where: {
            purchaseOrderId: req.params.purchase_order_id,
            isSynce: false,
            id: dr.id,
          },
        })
          .then((deliveryReceipt) => deliveryReceipt.update({ isSynce: true }))
          .catch((e) => {
            console.log('error : ', e);
            return res.status(422).json({ error: 'Error updating deliverRecepiet ' });
          });
        res.status(200).json({ success: deliveryReceipt });
      }
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Something happened when processing your request creating delivery receipt' });
    });
});

router.patch('/:id', (req, res, next) => {
  try {
    const purchaseOrderId = req.params.purchase_order_id;
    const data = req.body;

    if (data.delete !== true) {
      let dr;
      DeliveryReceipt.findOne({
        where: {
          purchaseOrderId: purchaseOrderId,
          id: data.deliveryID,
        },
      })
        .then((deliveryReceipt) =>
          deliveryReceipt.update({
            name: data.name,
            deliveredBy: data.deliveredBy,
            deliveredAt: data.deliveredAt,
          }),
        )
        .then(async (deliveryReceipt) => {
          dr = deliveryReceipt;
          return Promise.all(
            data.updatedDeliveries.map(async (deliveryData) => {
              let lastItemNumber = await DeliveryReceiptDetails.findAll({
                where: {
                  purchaseOrderId: purchaseOrderId,
                },
                attributes: ['lineItemNumber'],
                group: ['purchaseOrderId', 'lineItemNumber'],
                order: [['lineItemNumber', 'DESC']],
                limit: 1,
              });

              let purchaseOrderCreated;
              let lineItemNumber;
              let lineNumber;
              let returnValue = data.isReturnChecked ? '_R' : '_D';
              if (deliveryData.monsantoLotId) {
                const cmp = await CustomerMonsantoProduct.findOne({
                  where: {
                    id: deliveryData.customerProductId,
                  },
                });
                lineNumber = cmp.dataValues.lineNumber;
              }
              if (!lastItemNumber || !lastItemNumber.length) {
                lineItemNumber = '1';
                purchaseOrderCreated = purchaseOrderId + returnValue + lineNumber + '-' + lineItemNumber; // if it is return _R otherwise _D
                console.log(purchaseOrderCreated, 'purchaseOrderCreated');
              } else {
                let currentdeliveryData = await DeliveryReceiptDetails.findAll({
                  where: {
                    purchaseOrderId: purchaseOrderId,
                    monsantoProductId: deliveryData.monsantoProductId,
                  },
                  attributes: ['lineItemNumber'],
                  group: ['purchaseOrderId', 'lineItemNumber'],
                  order: [['lineItemNumber', 'DESC']],
                  limit: 1,
                });
                if (!currentdeliveryData || !currentdeliveryData.length) {
                  lineItemNumber = parseInt(lastItemNumber[0].dataValues.lineItemNumber) + 1;
                  purchaseOrderCreated = purchaseOrderId + returnValue + lineNumber + '-' + '1';
                } else {
                  let currentdeliveryDataCount = await DeliveryReceiptDetails.findAll({
                    where: {
                      purchaseOrderId: purchaseOrderId,
                      monsantoProductId: deliveryData.monsantoProductId,
                    },
                    attributes: ['lineNumber', 'lineItemNumber'],
                  });
                  lineItemNumber = parseInt(currentdeliveryData[0].dataValues.lineItemNumber);
                  purchaseOrderCreated =
                    purchaseOrderId + returnValue + lineNumber + '-' + parseInt(currentdeliveryDataCount.length + 1);
                }
              }

              if (deliveryData.deliveryDetailsId) {
                return DeliveryReceiptDetails.update(
                  {
                    amountDelivered: deliveryData.amountDelivered,
                    lotId: deliveryData.lotId,
                    monsantoLotId: deliveryData.monsantoLotId,
                    customProductId: deliveryData.customProductId,
                    monsantoProductId: deliveryData.monsantoProductId,
                    productId: deliveryData.productId,
                    customLotId: deliveryData.customLotId,
                    customerMonsantoProductId: deliveryData.customerMonsantoProductId,
                    crossReferenceId: deliveryData.crossReferenceId,
                  },
                  { where: { deliveryReceiptId: data.deliveryID, id: deliveryData.deliveryDetailsId } },
                );
              } else {
                return DeliveryReceiptDetails.create({
                  purchaseOrderId: purchaseOrderId,
                  lineItemNumber,
                  lineNumber,
                  purchaseOrderCreated,
                  deliveryReceiptId: dr.id,
                  amountDelivered: deliveryData.amountDelivered,
                  lotId: deliveryData.lotId,
                  monsantoLotId: deliveryData.monsantoLotId,
                  customProductId: deliveryData.customProductId,
                  monsantoProductId: deliveryData.monsantoProductId,
                  productId: deliveryData.productId,
                  customLotId: deliveryData.customLotId,
                  customerMonsantoProductId: deliveryData.customerMonsantoProductId,
                  crossReferenceId: deliveryData.crossReferenceId,
                });
              }
            }),
          );
        })

        .then(async () => {
          let isMonsanto;

          const deliveryReceipt = await DeliveryReceipt.findOne({
            where: {
              purchaseOrderId: purchaseOrderId,
              id: req.params.id,
              organizationId: req.user.organizationId,
            },
            include: [
              {
                model: DeliveryReceiptDetails,
                as: 'DeliveryReceiptDetails',
                attributes: ['id', 'monsantoProductId', 'amountDelivered', 'lineNumber', 'purchaseOrderCreated'],
              },
            ],
          });

          await deliveryReceipt.dataValues.DeliveryReceiptDetails.filter((deliveryData) => {
            if (deliveryData.monsantoProductId !== null) {
              isMonsanto = true;
            } else {
              isMonsanto = false;
            }
          });
          console.log(isMonsanto, 'isMonsanto');

          if (isMonsanto) {
            const monsantoUserData = await ApiSeedCompany.findOne({
              where: { organizationId: req.user.organizationId },
            });
            const po = await PurchaseOrder.findById(req.params.purchase_order_id);

            const customerData = await Customer.findOne({ where: { id: po.dataValues.customerId, isArchive: false } });

            const organization = await Organization.findById(req.user.organizationId);

            const productTransactions = await Promise.all(
              deliveryReceipt.dataValues.DeliveryReceiptDetails.map(async (record) => {
                const productName = await MonsantoProduct.findOne({
                  where: { id: record.monsantoProductId, organizationId: req.user.organizationId },
                  include: [
                    {
                      model: MonsantoProductLineItem,
                      as: 'LineItem',
                      attributes: ['suggestedDealerMeasurementUnitCode'],
                    },
                  ],
                });
                const ProductLineItems = [
                  {
                    ProductName: productName.dataValues.productDetail,
                    productId: productName.dataValues.crossReferenceId,
                    ProductQuantity: {
                      MeasurementValue: -parseFloat(record.amountDelivered),
                      Domain: JSON.parse(productName.LineItem.suggestedDealerMeasurementUnitCode).domain,
                      text: JSON.parse(productName.LineItem.suggestedDealerMeasurementUnitCode).value,
                    },
                    LineNumber: record.lineNumber,
                  },
                ];
                const InvoiceNumber = record.purchaseOrderCreated;
                console.log(ProductLineItems, 'ProductLineItems');
                return { ProductLineItems, InvoiceNumber };
              }),
            );

            const helper = {};
            const productTransactions2 = [];
            const arr2 = productTransactions.reduce(function (r2, o2) {
              const key = o2.ProductLineItems[0].productId;
              if (!helper[key]) {
                helper[key] = Object.assign({}, o2); // create a copy of o
                productTransactions2.push(helper[key]);
              } else {
                helper[key].ProductLineItems[0].ProductQuantity = {
                  ...helper[key].ProductLineItems[0].ProductQuantity,
                  MeasurementValue:
                    parseFloat(helper[key].ProductLineItems[0].ProductQuantity.MeasurementValue) +
                    parseFloat(o2.ProductLineItems[0].ProductQuantity.MeasurementValue),
                };
              }

              return r2;
            }, {});

            const isReturn = data.isReturnChecked;
            const xmlStringRequest = await buildproductMovementReportRequest({
              seedDealerMonsantoId: monsantoUserData.dataValues.glnId,
              organizationName: organization.dataValues.name,
              productTransactions: productTransactions2,
              monsantoUserData,
              customerData: customerData.dataValues,
              isReturn,
              invoiceDate: po.dataValues.createdAt,
            });
            request
              .post(config.monsantoEndPoint, {
                'content-type': 'text/plain',
                body: xmlStringRequest,
              })
              .then(async (response) => {
                console.log('i am then');
                const responseString = await parseXmlStringPromise(response);
              })
              .catch(async (e) => {
                const errorXmL = await parseXmlStringPromise(e.response.body);
                const errorString = parseShipNoticeError(errorXmL);

                await deliveryReceipt.update({ isSynce: false }, { where: { id: req.params.id } });
                return res.status(503).json({
                  error:
                    "The Delivery Receipt was Deleted successfully to Agri-Dealer. However we weren't able to sync it with Bayer's API yet. This is the error message from Bayer and please try syncing this GPOS delivery later. {" +
                    errorString
                      ? errorString
                      : '' + '}.',
                });
              });
          }
        })
        .then(() =>
          DeliveryReceipt.findOne({
            where: { id: dr.id },
            include: [
              {
                model: DeliveryReceiptDetails,
                attributes: [
                  'id',
                  'amountDelivered',
                  'deliveryReceiptId',
                  'lotId',
                  'createdAt',
                  'customProductId',
                  'isDeleted',
                  'monsantoLotId',
                  'monsantoProductId',
                  'customerMonsantoProductId',
                  'lineItemNumber',
                  'lineNumber',
                  'purchaseOrderCreated',
                ],
                include: [
                  {
                    model: Lot,
                    attributes: ['id', 'lotNumber'],
                    include: [
                      {
                        model: Product,
                      },
                    ],
                  },
                  {
                    model: CustomLot,
                    attributes: ['id', 'lotNumber'],
                    include: [
                      {
                        model: CustomProduct,
                      },
                    ],
                  },
                  {
                    model: MonsantoLot,
                    include: [
                      {
                        model: MonsantoProduct,
                        as: 'Product',
                      },
                    ],
                  },
                ],
              },
            ],
          }),
        )
        .then((deliveryReceipt) => {
          res.json(deliveryReceipt);
        })
        .catch((e) => {
          console.log('error : ', e);
          res.status(422).json({ error: 'Error updating DeliveryReceipt' });
        });
    } else {
      DeliveryReceiptDetails.update({ isDeleted: true }, { where: { deliveryReceiptId: req.params.id } })
        .then(() =>
          DeliveryReceipt.update(
            {
              isDeleted: true,
            },
            { where: { purchaseOrderId: purchaseOrderId, id: req.params.id } },
          ),
        )
        .then(async () => {
          let isMonsanto;

          const deliveryReceipt = await DeliveryReceipt.findOne({
            where: {
              purchaseOrderId: purchaseOrderId,
              id: req.params.id,
              organizationId: req.user.organizationId,
            },
            include: [
              {
                model: DeliveryReceiptDetails,
                as: 'DeliveryReceiptDetails',
                attributes: ['id', 'monsantoProductId', 'amountDelivered', 'lineNumber', 'purchaseOrderCreated'],
              },
            ],
          });

          await deliveryReceipt.dataValues.DeliveryReceiptDetails.filter((deliveryData) => {
            if (deliveryData.monsantoProductId !== null) {
              isMonsanto = true;
            } else {
              isMonsanto = false;
            }
          });
          console.log(isMonsanto, 'isMonsanto');

          if (isMonsanto) {
            const monsantoUserData = await ApiSeedCompany.findOne({
              where: { organizationId: req.user.organizationId },
            });
            const po = await PurchaseOrder.findById(req.params.purchase_order_id);

            const customerData = await Customer.findOne({ where: { id: po.dataValues.customerId, isArchive: false } });

            const organization = await Organization.findById(req.user.organizationId);

            const productTransactions = await Promise.all(
              deliveryReceipt.dataValues.DeliveryReceiptDetails.map(async (record) => {
                const productName = await MonsantoProduct.findOne({
                  where: { id: record.monsantoProductId, organizationId: req.user.organizationId },
                  include: [
                    {
                      model: MonsantoProductLineItem,
                      as: 'LineItem',
                      attributes: ['suggestedDealerMeasurementUnitCode'],
                    },
                  ],
                });
                const ProductLineItems = [
                  {
                    ProductName: productName.dataValues.productDetail,
                    productId: productName.dataValues.crossReferenceId,
                    ProductQuantity: {
                      MeasurementValue: -parseFloat(record.amountDelivered),
                      Domain: JSON.parse(productName.LineItem.suggestedDealerMeasurementUnitCode).domain,
                      text: JSON.parse(productName.LineItem.suggestedDealerMeasurementUnitCode).value,
                    },
                    LineNumber: record.lineNumber,
                  },
                ];
                const InvoiceNumber = record.purchaseOrderCreated;
                console.log(ProductLineItems, 'ProductLineItems');
                return { ProductLineItems, InvoiceNumber };
              }),
            );

            const helper = {};
            const productTransactions2 = [];
            const arr2 = productTransactions.reduce(function (r2, o2) {
              const key = o2.ProductLineItems[0].productId;
              if (!helper[key]) {
                helper[key] = Object.assign({}, o2); // create a copy of o
                productTransactions2.push(helper[key]);
              } else {
                helper[key].ProductLineItems[0].ProductQuantity = {
                  ...helper[key].ProductLineItems[0].ProductQuantity,
                  MeasurementValue:
                    parseFloat(helper[key].ProductLineItems[0].ProductQuantity.MeasurementValue) +
                    parseFloat(o2.ProductLineItems[0].ProductQuantity.MeasurementValue),
                };
              }

              return r2;
            }, {});

            const isReturn = data.isReturnChecked;
            const xmlStringRequest = await buildproductMovementReportRequest({
              seedDealerMonsantoId: monsantoUserData.dataValues.glnId,
              organizationName: organization.dataValues.name,
              productTransactions: productTransactions2,
              monsantoUserData,
              customerData: customerData.dataValues,
              isReturn,
              invoiceDate: po.dataValues.createdAt,
            });
            request
              .post(config.monsantoEndPoint, {
                'content-type': 'text/plain',
                body: xmlStringRequest,
              })
              .then(async (response) => {
                console.log('i am then');
                const responseString = await parseXmlStringPromise(response);

                if (responseString) {
                  console.log("It's succesfully remove from GPOS");
                }
              })
              .catch(async (e) => {
                const errorXmL = await parseXmlStringPromise(e.response.body);
                const errorString = parseShipNoticeError(errorXmL);
                return res.status(503).json({
                  error:
                    "The Delivery Receipt was Deleted successfully to Agri-Dealer. However we weren't able to sync it with Bayer's API yet. This is the error message from Bayer and please try syncing this GPOS delivery later. {" +
                    errorString
                      ? errorString
                      : '' + '}.',
                });
              });
          }
          res.json({ ok: `DeliveryRecepit  id = ${req.params.id} succesfully deleted` });
        })
        .catch((e) => {
          console.log('error : ', e);
          res.status(422).json({ error: 'Error deleting DeliveryReceipt' });
        });
    }
  } catch (e) {
    console.log(e, 'e');
  }
});
router.get('/last_update', (req, res) => {
  DeliveryReceipt.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"DeliveryReceipt"."updatedAt" DESC'),
    limit: 1,
  })
    .then((deliveryReceipts) => {
      let lastUpdate = (deliveryReceipts[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

router.patch('/delete/:id', (req, res) => {
  const purchaseOrderId = req.params.purchase_order_id;
  DeliveryReceiptDetails.update(
    { where: { deliveryReceiptId: req.params.id } },
    {
      isDeleted: true,
    },
  )
    .then(() =>
      DeliveryReceipt.update(
        { where: { purchaseOrderId: purchaseOrderId, id: req.params.id } },
        {
          isDeleted: true,
        },
      ),
    )
    .then(() => res.json({ ok: `DeliveryRecepit  id = ${req.params.id} succesfully deleted` }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting DeliveryReceipt' });
    });
});

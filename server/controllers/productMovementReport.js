const request = require('request-promise');
const config = require('config').getConfig();
const {
  productBooking: { buildProductBookingRequest, parseProductBookingResponse },

  productMovementReport: { buildproductMovementReportRequest },
  common: { parseXmlStringPromise, parseShipNoticeError },
} = require('utilities/xml');
const { Op } = require('sequelize');

const {
  ApiSeedCompany,
  Organization,
  MonsantoProduct,
  PurchaseOrder,
  Customer,
  DeliveryReceipt,
  DeliveryReceiptDetails,
  MonsantoProductLineItem,
} = require('models');

module.exports = async (req, res, next) => {
  try {
    const { purchaseOrderId } = req.body;
    const monsantoUserData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });
    const po = await PurchaseOrder.findById(purchaseOrderId);

    const customerData = await Customer.findOne({ where: { id: po.dataValues.customerId, isArchive: false } });

    const organization = await Organization.findById(req.user.organizationId);
    await DeliveryReceipt.findAll({
      where: {
        purchaseOrderId: purchaseOrderId,
        isSynce: false,
        isDeleted: false,
      },
      include: [
        {
          model: DeliveryReceiptDetails,
          where: {
            monsantoProductId: { $ne: null },
          },
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
    })
      .then(async (updatedRecords) => {
        if (updatedRecords.length !== 0) {
          await Promise.all(
            await updatedRecords.map(async (item, i) => {
              setTimeout(async () => {
                item.dataValues.DeliveryReceiptDetails.map(async (record) => {
                  if (record.length !== 0 && record.monsantoProductId !== null) {
                    const productName = await MonsantoProduct.findOne({
                      where: {
                        id: record.monsantoProductId,
                        classification: {
                          [Op.not]: 'P',
                        },
                        organizationId: req.user.organizationId,
                      },
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
                          MeasurementValue: record.amountDelivered,
                          Domain: JSON.parse(productName.LineItem.suggestedDealerMeasurementUnitCode).domain,
                          text: JSON.parse(productName.LineItem.suggestedDealerMeasurementUnitCode).value,
                        },
                        LineNumber: record.lineNumber,
                      },
                    ];
                    const InvoiceNumber = record.purchaseOrderCreated;
                    // return { ProductLineItems, InvoiceNumber };
                    const isReturn = item.isReturn;
                    const productTransactions = [{ InvoiceNumber, ProductLineItems }];
                    const xmlStringRequest = await buildproductMovementReportRequest({
                      seedDealerMonsantoId: monsantoUserData.dataValues.glnId,
                      organizationName: organization.dataValues.name,
                      productTransactions,
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
                        const responseString = await parseXmlStringPromise(response);
                        if (responseString) {
                          await DeliveryReceipt.update(
                            { isSynce: true },
                            {
                              where: {
                                purchaseOrderId: purchaseOrderId,
                                isSynce: false,
                              },
                            },
                          )
                            .then(async () => {
                              const apiSeedCompany = await ApiSeedCompany.findOne({
                                where: {
                                  organizationId: req.user.organizationId,
                                  isDeleted: false,
                                },
                              });

                              const CustomerOrders = await CustomerMonsantoProduct.all({
                                where: {
                                  purchaseOrderId: purchaseOrderId,
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
                                await CustomerMonsantoProduct.all({
                                  where: {
                                    purchaseOrderId: record.purchaseOrderId,
                                    id: record.customerMonsantoProductId,
                                    monsantoProductId: record.monsantoProductId,
                                  },
                                  include: [
                                    {
                                      model: MonsantoProduct,
                                      where: {
                                        classification: {
                                          [Op.not]: 'P',
                                        },
                                      },
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
                                    const value = record.amountDelivered;
                                    increaseOrDecrease.value = Math.abs(value);
                                    const qtyValue = order.monsantoOrderQty - record.amountDelivered;
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
                                      orderQty: order.monsantoOrderQty - record.amountDelivered,
                                      monsantoOrderQty: order.monsantoOrderQty,
                                      requestedShipDate: x2, // ASK sourabh
                                      isDeleted: order.isDeleted,
                                      lineItem: order.MonsantoProduct.LineItem,
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
                                    orderNumber: purchaseOrderId,
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
                                          purchaseOrderId: purchaseOrderId,
                                          id: item.customerProductId,
                                          monsantoProductId: item.monsantoProductId,
                                        },
                                        include: [
                                          {
                                            model: MonsantoProduct,
                                            where: {
                                              classification: {
                                                [Op.not]: 'P',
                                              },
                                            },
                                            include: [{ model: MonsantoProductLineItem, as: 'LineItem' }],
                                          },
                                          {
                                            model: PurchaseOrder,
                                            as: 'PurchaseOrder',
                                          },
                                        ],
                                      })
                                        .then(async (CustomerOrders) => {
                                          await CustomerOrders.map((order) => {
                                            const qtyValue = order.orderQty - item.amountDelivered;
                                            if (qtyValue > 0) {
                                              CustomerMonsantoProduct.update(
                                                { orderQty: qtyValue },
                                                {
                                                  where: {
                                                    purchaseOrderId: purchaseOrderId,
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
                                  const errorXmL = await parseXmlStringPromise(e.response.body);
                                  const errorString = parseMainProductBookingError(errorXmL);
                                  return res.status(503).json({
                                    error: errorString,
                                  });
                                });
                            })
                            .catch((e) => {
                              return res.status(422).json({ error: 'Error updating deliverRecepiet ' });
                            });
                        }
                        res.status(200).send({ success: responseString });
                      })
                      .catch(async (e) => {
                        console.log(`error at product movment ${e}`);

                        if (e.response && e.response.body) {
                          const errorXmL = await parseXmlStringPromise(e.response.body);
                          const errorString = parseShipNoticeError(errorXmL);
                          return res.status(503).json({
                            error: errorString || 'The proxy server could not handle the request ',
                          });
                        } else {
                          return res.status(503).json({
                            error: `error at product movment ${e}` || 'The proxy server could not handle the request ',
                          });
                        }
                      });

                    console.log('all done product movement');
                  } else {
                    res.status(200).send({ success: 'No Monsanto Receipt available' });
                  }
                });
              }, i * 3000);
            }),
          );
        } else {
          console.log('data not found');
          res.status(200).json({ success: 'All Recepit are synce' });
        }
      })
      .catch((e) => {
        console.log('error at Monsanto', e);
        res.status(502).json({ error: 'Something happened when processing your request' });
      });
  } catch (error) {
    console.log(error);
    res.status(503).json({ error: 'Something happened when processing your request' });
  }
};

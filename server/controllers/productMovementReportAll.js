const request = require('request-promise');
const config = require('config').getConfig();
const {
  productBooking: { buildProductBookingRequest, parseProductBookingResponse },

  productMovementReport: { buildproductMovementReportRequest },
  common: { parseXmlStringPromise, parseShipNoticeError },
} = require('utilities/xml');
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
    console.log('In sync All GPOS');
    const monsantoUserData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });

    const customerData = await Customer.findAll({
      where: { organizationId: req.user.organizationId, isArchive: false, isDeleted: false },
      raw: true,
    });

    await Promise.all(
      customerData
        .filter((c) => c.name !== 'Bayer Dealer Bucket')
        .map(async (customer) => {
          const po = await PurchaseOrder.findAll({
            where: { organizationId: req.user.organizationId, customerId: customer.id, isDeleted: false },
          });

          try {
            po.map(async (p, i) => {
              setTimeout(async () => {
                const organization = await Organization.findById(req.user.organizationId);
                await DeliveryReceipt.findAll({
                  where: {
                    purchaseOrderId: p.id,
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
                      ],
                    },
                  ],
                })
                  .then(async (updatedRecords) => {
                    if (updatedRecords.length !== 0) {
                      await Promise.all(
                        await updatedRecords.map(async (item) => {
                          item.dataValues.DeliveryReceiptDetails.map(async (record) => {
                            if (record.length !== 0 && record.monsantoProductId !== null) {
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
                                customerData: customerData,
                                isReturn,
                                invoiceDate: p.dataValues.createdAt,
                              });
                              console.log(xmlStringRequest, 'xmlStringRequest');
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
                                          purchaseOrderId: p.id,
                                          isSynce: false,
                                        },
                                      },
                                    )
                                      .then(() => console.log('update succesfully'))
                                      .catch((e) => {
                                        // console.log('error : ', e);
                                        return res.status(422).json({ error: 'Error updating deliverRecepiet ' });
                                      });
                                  }
                                  res.status(200).send({ success: responseString });
                                })
                                .catch(async (e) => {
                                  //   console.log(`error at product movment ${e}`);
                                  const errorXmL = await parseXmlStringPromise(e.response.body);
                                  const errorString = parseShipNoticeError(errorXmL);
                                  return res.status(503).json({
                                    error: errorString || 'The proxy server could not handle the request ',
                                  });
                                  // res.status(502).json({ error: 'The proxy server could not handle the request ' });
                                });

                              console.log('all done in all synce receipts');
                            } else {
                              res.status(200).send({ success: 'No Monsanto Receipt available' });
                            }
                          });
                        }),
                      );
                    } else {
                      res.status(200).send({ success: 'No Monsanto Receipt available' });
                    }
                  })
                  .catch((e) => {
                    // console.log('error at Monsanto', e);
                    res.status(502).json({ error: 'Something happened when processing your request' });
                  });
              }, i * 2000);
            });
          } catch (e) {
            console.log(e, 'e');
          }
        }),
    );
  } catch (error) {
    // console.log(error, '------');
    res.status(503).json({ error: 'Something happened when processing your request' });
  }
};

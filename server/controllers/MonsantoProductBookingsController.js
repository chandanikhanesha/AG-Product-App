const request = require('request-promise');
const config = require('config').getConfig();
const emailUtility = require('utilities/email');

const { Op } = require('sequelize');
const {
  productBooking: { buildProductBookingRequest, parseProductBookingResponse },
  common: { parseXmlStringPromise, parseMainProductBookingError },
} = require('utilities/xml');
const { create: monsantoReqLogCreator } = require('../middleware/monsantoReqLogCreator');
const {
  CustomerMonsantoProduct,
  Customer,
  MonsantoProduct,
  MonsantoProductLineItem,
  ApiSeedCompany,
  Organization,
  PurchaseOrder,
} = require('models');
const { parseProductBookingError, calculateSeedYear } = require('../utilities/xml/common');
const { create: transferLog } = require('../middleware/transferLog');

const bayerAPIDown = process.env.IS_BAYER_API_DOWN;
const fs = require('fs');
const path = require('path');

const hardCodeXmlNew = fs.readFileSync(path.join(__dirname, '../utilities/xmlResponse/productBooking(New).xml'), {
  encoding: 'utf8',
});
const hardCodeXmlChanged = fs.readFileSync(
  path.join(__dirname, '../utilities/xmlResponse/productBooking(Changed).xml'),
  {
    encoding: 'utf8',
  },
);

// Generic Functions
async function makeProductBookingRequest({
  orders,
  organizationName,
  seedDealerMonsantoId,
  res,
  isDealerBucket,
  monsantoUserData,
  organizationAddress,
  organizationBusinessCity,
  organizationBusinessState,
  organizationBusinessZip,
}) {
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
    console.log('error ', e);
    // return res.status(503).json({ error: e.message || e || 'Something happened when processing your request' });
  }
}

module.exports.summary = async (req, res) => {
  const { seedDealerMonsantoId, organizationName, order } = req.query;
  order.orderType = 'SummaryRequest';
  return makeProductBookingRequestSummary({
    seedDealerMonsantoId,
    organizationName,
    orders: [order],
    res,
  });
};

/*
Create Request Sample:
{
    "order": {
      "orderNumber": "611566318",
      "orderReference": "0611566318",
      "productYear": 2019,  //optional
      "directShip": 1, // optional  enum: 0:1
      "issuedDate": "2019-01-09T14:11:18Z",
      "specialInstructions": {
        "type": "MarkingInstructions",
        "content": "West Farm"
      },
      "shipTo": {
        "name": "BOYD GIGAX",
        "identifier": "1100031728863",
        "agency": "GLN",
        "addressInformation": {
          "city": "",
          "state": "NE",
          "postalCode": "10000",
          "postalCountry": "US",
          "address": ""
        }
      }//customer whom we are making the booking,
      "products": [{
        "lineNumber": "999999",
        "productBookingLineItemNumber": "1",
        "action": "Add",
        "requestedDate": "2019-06-03T12:15:30Z",
        "crossReferenceProductId": "00883580763448" //AGIIS-XXX,
        "increaseOrDecrease": {
          "type": "Increase",
          "value": "50",
          "unit": "BG"
        },
        "quantity": {
          "value": "50",
           "unit": "BG"
        },
        "requestedShipDate": "2019-06-03T12:15:30Z",
        "specialInstructions": {
          "type": "General",
          "content": "Plant Early"
        }//Optional,
      }]
    }
    "seedCompanyId": 23
}
*/

module.exports.create = async (req, res) => {
  const {
    seedDealerMonsantoId,
    seedCompanyId,
    organizationName,
    customerId,
    notAvailableProducts,
    syncMonsantoProductIds,
    isDealerBucket,
  } = req.body;
  let notAvailableProductIds = [];
  let monsantoRequest = {};
  let msg = 'Sync with bayer Done!';
  notAvailableProducts.forEach((notAvailableProduct) => {
    notAvailableProductIds.push(notAvailableProduct.id);
  });
  const customer = await Customer.findOne({
    where: { id: customerId },
    raw: true,
  });

  const hasSalesOrderReference = await CustomerMonsantoProduct.findOne({
    where: {
      organizationId: req.user.organizationId,
      purchaseOrderId: req.params.id,
      isPickLater: false,
      orderQty: {
        [Op.gte]: 0,
      },
    },
    include: [
      {
        model: PurchaseOrder,
        as: 'PurchaseOrder',
      },
    ],
  });

  let orders = await CustomerMonsantoProduct.findAll({
    where: {
      organizationId: req.user.organizationId,
      purchaseOrderId: req.params.id,
      isPickLater: {
        [Op.or]: [false, null],
      },

      isSent: false,
      isDeleted: false,
      orderQty: {
        [Op.gte]: 0,
      },
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
    ],
  });

  // remove orders with same pending
  orders = await orders.filter(
    (order) =>
      syncMonsantoProductIds.includes(order.dataValues.id) ||
      (order.isDeleted && !order.isDeleteSynced && !notAvailableProductIds.includes(order.id)),
  );

  // // orders = await [...new Map(orders.map((item, key) => [item[key], item])).values()];

  if (orders.length < 1) return res.status(200).json({ synced: true, msg: msg });

  const organization = await Organization.findById(req.user.organizationId);
  const organizationAddress = organization.dataValues.address;
  const organizationBusinessCity = organization.dataValues.businessCity;
  const organizationBusinessState = organization.dataValues.businessState;
  const organizationBusinessZip = organization.dataValues.businessZip;
  let x = new Date().toISOString().split('Z');
  let x1 = x[0].split('.');
  let x2 = x1[0] + '-05:00';

  orders.map((order, index) => {
    // order.lineItemNumber = index + 1;
    order.save();
    return order;
  });

  const monsantoUserData = await ApiSeedCompany.findOne({
    where: { organizationId: req.user.organizationId },
  });
  const getProducts = () => {
    return orders
      .filter((order) => order.isDeleted == false)
      .map((order) => {
        const increaseOrDecrease = {
          type: 'Increase',
          unit: order.unit,
        };
        if (order.monsantoOrderQty === undefined || order.monsantoOrderQty === null) {
          increaseOrDecrease.value = order.orderQty;
        } else {
          const diff = order.monsantoOrderQty - order.orderQty;
          if (diff > 0) increaseOrDecrease.type = 'Decrease';
          increaseOrDecrease.value = Math.abs(diff);
        }

        return {
          lineNumber: order.lineNumber || '999999',
          lineItemNumber: order.lineItemNumber,
          action: order.orderQty == 0 ? 'Delete' : order.monsantoOrderQty > 0 ? 'Change' : 'Add',
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
  let hardCodeResponse;

  if (!hasSalesOrderReference || hasSalesOrderReference.PurchaseOrder.salesOrderReference == null) {
    hardCodeResponse = await parseXmlStringPromise(hardCodeXmlNew);
    monsantoRequest = {
      orders: [
        {
          orderType: 'New',
          orderNumber: req.params.id,
          productYear: calculateSeedYear(),
          directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
          issuedDate: x2,
          // specialInstructions: {
          //   type: "MarkingInstructions",
          //   content: "West Farm"
          // }, // TODO: commented until we discuss or support this on the UI
          shipTo: {
            name: organization.dataValues.name || customer.organizationName || customer.name, //TODO discusss if organization name should be mandatory
            identifier: customer.glnId !== null ? customer.glnId : customer.monsantoTechnologyId,
            agency:
              customer.name == 'Bayer Dealer Bucket' ? 'GLN' : customer.glnId !== null ? 'GLN' : 'AssignedBySeller',
            addressInformation: {
              city: customer.businessCity || '',
              state: customer.businessState || 'NE',
              postalCode: customer.businessZip || '10000',
              postalCountry: 'US', //TODO: ask sourabh
              address: customer.deliveryAddress || '',
            },
          },
          products: getProducts(),
          seedCompanyId,
        },
      ],
      organizationName,
      seedDealerMonsantoId,
      res,
      isDealerBucket,
      monsantoUserData,
      organizationAddress,
      organizationBusinessCity,
      organizationBusinessState,
      organizationBusinessZip,
    };
  } else {
    hardCodeResponse = await parseXmlStringPromise(hardCodeXmlChanged);
    // add more item in current order
    monsantoRequest = {
      orders: [
        {
          orderType: 'Changed',
          orderNumber: req.params.id,
          productYear: calculateSeedYear(),
          directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
          issuedDate: x2,
          // "specialInstructions": {
          //   "type": "MarkingInstructions",
          //   "content": "West Farm"
          // },  // TODO: commented until we discuss or support this on the UI
          shipTo: {
            name: organization.dataValues.name || customer.organizationName || customer.name, //TODO discusss if organization name should be mandatory
            identifier: customer.glnId !== null ? customer.glnId : customer.monsantoTechnologyId,
            agency:
              customer.name == 'Bayer Dealer Bucket' ? 'GLN' : customer.glnId !== null ? 'GLN' : 'AssignedBySeller',

            addressInformation: {
              city: customer.businessCity || '',
              state: customer.businessState || 'NE',
              postalCode: customer.businessZip || '10000',
              postalCountry: 'US', //TODO: ask sourabh
              address: customer.deliveryAddress || '',
            },
          },
          products: getProducts(),
          seedCompanyId,
          orderReference: hasSalesOrderReference.PurchaseOrder.salesOrderReference,
        },
      ],
      organizationName,
      seedDealerMonsantoId,
      res,
      isDealerBucket,
      monsantoUserData,
      organizationAddress,
      organizationBusinessCity,
      organizationBusinessState,
      organizationBusinessZip,
    };
  }

  try {
    const xmlStringRequest = await makeProductBookingRequest(monsantoRequest);
    const response = await request.post(config.monsantoEndPoint, {
      'content-type': 'text/plain',
      body: xmlStringRequest,
    });
    const responseString = await parseXmlStringPromise(response);

    const rawResponseData = bayerAPIDown === 'true' ? hardCodeResponse : responseString;
    const monsantoResponse = await parseProductBookingResponse(rawResponseData);
    const {
      properties: { crossRefIdentifier, responseStatus },
      details,
      impactSummary,
    } = monsantoResponse;

    monsantoReqLogCreator({
      req,
      userName: customer.name + '(' + customerId + ')',
      type: 'product booking(new)',
      uuid: monsantoResponse.uuid,
      description: JSON.stringify(responseStatus),
    });

    const { errorMsg, warningMsg, isError } = parseProductBookingError(responseStatus, details);
    if (isError) throw errorMsg; // generates an exception
    if (warningMsg) msg = warningMsg;

    //update Customer bayer Product
    await Promise.all(
      details.map(async (detail) => {
        const customerMonsantoProductDetail = orders.find(
          (order) =>
            parseInt(order.lineItemNumber, 10) === parseInt(detail.productBookingLineItemNumber, 10) &&
            order.MonsantoProduct.crossReferenceId === detail.identification.identifier,
        );
        const customerMonsantoProduct =
          customerMonsantoProductDetail &&
          (await CustomerMonsantoProduct.findOne({ where: { id: customerMonsantoProductDetail.id } }));

        await PurchaseOrder.update(
          { salesOrderReference: crossRefIdentifier },
          { where: { id: customerMonsantoProduct.dataValues.purchaseOrderId } },
        );

        await customerMonsantoProduct
          .update({
            lineNumber: detail.lineNumber,
            lineItemNumber: detail.productBookingLineItemNumber,
            unit: detail.quantity.unit,
            monsantoOrderQty: parseFloat(detail.quantity.value, 10),
            unit: detail.quantity.unit,
            isSent: true,
            isDeleted: parseFloat(detail.quantity.value, 10) == 0 ? true : false,
            isDeleteSynced:
              (customerMonsantoProductDetail.orderQty === 0 && customerMonsantoProductDetail.isDeleted) ||
              parseFloat(detail.quantity.value, 10) == 0
                ? true
                : false,
          })
          .then(async (customerMonsantoProduct) => {
            const monsantoProduct = await MonsantoProduct.findById(
              customerMonsantoProduct.dataValues.monsantoProductId,
            );

            customerMonsantoProduct.dataValues &&
              transferLog({
                req,
                productName: monsantoProduct.dataValues.productDetail,
                action: { synced: `Synced Row with Bayer`, BayerUUID: monsantoResponse.uuid },
                otherDetail: { BayerStatus: 'synced Done' },
                purchaseOrderId: customerMonsantoProduct.dataValues.purchaseOrderId,
                productId: customerMonsantoProduct.dataValues.monsantoProductId,
                rowId: customerMonsantoProduct.dataValues.id,
              });
          });
      }),
    );

    const AllMonsantoData = await CustomerMonsantoProduct.all({
      where: {
        organizationId: req.user.organizationId,
        isDeleted: false,
        isPickLater: false,

        isSent: true,
      },
      attributes: ['monsantoProductId', 'monsantoOrderQty'],
      group: ['monsantoProductId', 'monsantoOrderQty'],

      raw: true,
    });

    const sumOfAllMonsantoData = await AllMonsantoData.filter((order) => syncMonsantoProductIds.includes(order.id));

    var finalMonsantoData = [];
    sumOfAllMonsantoData.reduce(function (res, value) {
      const pID = value.monsantoProductId;
      if (!res[pID]) {
        res[pID] = {
          monsantoProductId: value.monsantoProductId,
          monsantoOrderQty: 0,
        };
        finalMonsantoData.push(res[pID]);
      }
      res[pID].monsantoOrderQty += parseFloat(value.monsantoOrderQty);

      return res;
    }, {});

    let monsantoProduct = [];

    await Promise.all([
      impactSummary !== undefined &&
        finalMonsantoData.length > 0 &&
        finalMonsantoData.map(async (data) => {
          await MonsantoProduct.findOne({
            where: {
              id: data.monsantoProductId,
              crossReferenceId: impactSummary[0].crossReferenceId,
              organizationId: req.user.organizationId,
            },
            raw: true,
            attributes: ['id', 'crossReferenceId'],
          }).then(async (res) => {
            (await res) !== null && monsantoProduct.push(res);
          });
        }),
    ]);

    if (impactSummary !== undefined && finalMonsantoData.length > 0 && monsantoProduct.length > 0) {
      const isMatch = finalMonsantoData.filter(
        (s) =>
          s.monsantoOrderQty !==
          parseFloat(impactSummary[0].longShort.value && s.monsantoProductId === monsantoProduct[0].id),
      );
      if (isMatch.length > 0) {
        emailUtility.sendEmail(
          'dev@agridealer.co',
          'Impact Summury Long/short Not match',
          `Impact Summury Long/short Not match with sum of customer Monsanto Product MonsantoQty`,
          `<p>Below Product Qty not match with impactSummary Long/Short Value ${
            impactSummary[0].longShort.value
          }</p><br></br>${finalMonsantoData.map((data) => {
            return `<p>This MonsantoProduct ID record ${data.monsantoProductId} has a monsantoOrderQty sum of ${data.monsantoOrderQty} and an OrganizationID of  ${req.user.organizationId}.

            </p>`;
          })}`,
          null,
        );
      }
    }
    console.log('synced done');
    return res.status(200).json({ synced: true, msg: msg, impactSummary });
  } catch (error) {
    orders.map(async (customerMonsantoProduct) => {
      const errorXmL = error.response && (await parseXmlStringPromise(error.response.body));
      const errorString = errorXmL && parseMainProductBookingError(errorXmL);
      const monsantoProduct = await MonsantoProduct.findById(customerMonsantoProduct.dataValues.monsantoProductId);
      customerMonsantoProduct &&
        transferLog({
          req,
          productName: monsantoProduct.dataValues.productDetail,
          action: { synced: `Synced Row with Bayer` },
          otherDetail: {
            BayerStatus: 'synced UnSuccessfull',
            error: error.response
              ? errorString
              : `Error syncing summary: ${error}|| Line Item Number is Duplicate found`,
          },
          purchaseOrderId: customerMonsantoProduct.dataValues.purchaseOrderId,
          productId: customerMonsantoProduct.dataValues.monsantoProductId,
          rowId: customerMonsantoProduct.dataValues.id,
        });
    });
    if (error.response && error.response.body) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      const errorString = parseMainProductBookingError(errorXmL);

      return res.status(503).json({ error: errorString || 'something wrong with the api for now!', synced: false });
    } else {
      console.log(`Error syncing retailer order summary in PB controller: ${error}`, error.statusCode);
      return res.status(error.statusCode ? error.statusCode : 503).json({
        error: `Error syncing : ${error ? error : 'Line Item Number is Duplicate found'}`,
        synced: false,
      });
    }
  }
};

module.exports.transfer = async (req, res) => {
  let { orders } = req.body;

  orders.map(async (order) => {
    //TODO: is possible to make a grower to grower transfer to a brand new product booking so we can improve this function
    // to create a new one in case we could find any product with isSent
    const monsantoOrder = CustomerMonsantoProduct.findOne({
      where: {
        purchaseOrderId: order.purchaseOrderId,
        isSent: true,
      },
    });
    return {
      ...monsantoOrder,
      ...order,
    };
  });
};

module.exports.edit = async (req, res) => {
  //TODO: we need the order cross reference first, so probably we will need to find
  // it in our DB
  const { seedDealerMonsantoId, organizationName } = req.body;
  let { orders } = req.body;
  orders = orders.map((order) => ({
    ...order,
    orderType: 'Changed',
  }));
  return makeProductBookingRequest({
    seedDealerMonsantoId,
    organizationName,
    orders,
    res,
    monsantoUserData,
  });
};
module.exports.createAll = async (req, res) => {
  // const organizationData = ;

  let notAvailableProductIds = [];
  let monsantoRequest = {};
  let msg = 'Sync with bayer Done!';

  const customerData = await Customer.findAll({
    where: { organizationId: req.user.organizationId, isArchive: false, isDeleted: false },
    raw: true,
  });

  await Promise.all(
    customerData
      .filter((c) => c.name !== 'Bayer Dealer Bucket')
      .map(async (customer) => {
        const poData = await PurchaseOrder.findAll({
          where: { organizationId: req.user.organizationId, customerId: customer.id, isDeleted: false },
          raw: true,
        });

        try {
          poData.map(async (p, i) => {
            console.log(p.id, '-');
            setTimeout(async () => {
              const hasSalesOrderReference = await CustomerMonsantoProduct.findOne({
                where: {
                  organizationId: req.user.organizationId,
                  purchaseOrderId: p.id,
                  orderQty: {
                    [Op.gte]: 0,
                  },
                },
                include: [
                  {
                    model: PurchaseOrder,
                    as: 'PurchaseOrder',
                  },
                ],
              });

              let orders = await CustomerMonsantoProduct.all({
                where: {
                  organizationId: req.user.organizationId,
                  purchaseOrderId: p.id,
                  isSent: false,
                  isDeleted: false,
                  orderQty: {
                    [Op.gte]: 0,
                  },
                },

                include: [
                  {
                    model: MonsantoProduct,
                    include: [{ model: MonsantoProductLineItem, as: 'LineItem' }],
                  },
                ],
              });
              //remove orders with same pending
              console.log(orders.length, 'orders.length111111');

              // orders = await orders.filter((order) => order.isDeleted && !order.isDeleteSynced);

              if (orders.length > 0) {
                // orders.map((order, index) => {
                //   // order.lineItemNumber = index + 1;
                //   order.save();
                //   return order;
                // });

                const monsantoUserData = await ApiSeedCompany.findOne({
                  where: { organizationId: req.user.organizationId },
                });
                const getProducts = async () => {
                  return await orders
                    .filter((order) => order.isDeleted == false)
                    .map((order) => {
                      const increaseOrDecrease = {
                        type: 'Increase',
                        unit: order.unit,
                      };
                      if (order.monsantoOrderQty === undefined || order.monsantoOrderQty === null) {
                        increaseOrDecrease.value = order.orderQty;
                      } else {
                        const diff = order.monsantoOrderQty - order.orderQty;
                        if (diff > 0) increaseOrDecrease.type = 'Decrease';
                        increaseOrDecrease.value = Math.abs(diff);
                      }

                      return {
                        lineNumber: order.lineNumber || '999999',
                        lineItemNumber: order.lineItemNumber,
                        action: order.orderQty == 0 ? 'Delete' : order.monsantoOrderQty > 0 ? 'Change' : 'Add',
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
                const organization = await Organization.findOne({ where: { id: req.user.organizationId } });
                const organizationAddress = organization.dataValues.address;
                const organizationBusinessCity = organization.dataValues.businessCity;
                const organizationBusinessState = organization.dataValues.businessState;
                const organizationBusinessZip = organization.dataValues.businessZip;
                let x = new Date().toISOString().split('Z');
                let x1 = x[0].split('.');
                let x2 = x1[0] + '-05:00';

                if (!hasSalesOrderReference || hasSalesOrderReference.PurchaseOrder.salesOrderReference == null) {
                  monsantoRequest = {
                    orders: [
                      {
                        orderType: 'New',
                        orderNumber: p.id,
                        productYear: calculateSeedYear(),
                        directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
                        issuedDate: x2,
                        // specialInstructions: {
                        //   type: "MarkingInstructions",
                        //   content: "West Farm"
                        // }, // TODO: commented until we discuss or support this on the UI
                        shipTo: {
                          name: customer.organizationName || customer.name, //TODO discusss if organization name should be mandatory
                          identifier: customer.glnId !== null ? customer.glnId : customer.monsantoTechnologyId,
                          agency:
                            customer.name == 'Bayer Dealer Bucket'
                              ? 'GLN'
                              : customer.glnId !== null
                              ? 'GLN'
                              : 'AssignedBySeller',

                          addressInformation: {
                            city: customer.businessCity || '',
                            state: customer.businessState || 'NE',
                            postalCode: customer.businessZip || '10000',
                            postalCountry: 'US', //TODO: ask sourabh
                            address: customer.deliveryAddress || '',
                          },
                        },
                        products: await getProducts(),
                        seedCompanyId: monsantoUserData.dataValues.id,
                      },
                    ],
                    organizationName: organization.name,
                    seedDealerMonsantoId: monsantoUserData.dataValues.glnId,
                    res,
                    isDealerBucket: false,
                    monsantoUserData,
                    organizationAddress,
                    organizationBusinessCity,
                    organizationBusinessState,
                    organizationBusinessZip,
                  };
                } else {
                  // add more item in current order
                  monsantoRequest = {
                    orders: [
                      {
                        orderType: 'Changed',
                        orderNumber: p.id,
                        productYear: calculateSeedYear(),
                        directShip: 0, // optional  enum: 0:1 //0 is not currently supported by bayer logistics or it is considered an edge case
                        issuedDate: x2,
                        // "specialInstructions": {
                        //   "type": "MarkingInstructions",
                        //   "content": "West Farm"
                        // },  // TODO: commented until we discuss or support this on the UI
                        shipTo: {
                          name: customer.organizationName || customer.name, //TODO discusss if organization name should be mandatory
                          identifier: customer.glnId !== null ? customer.glnId : customer.monsantoTechnologyId,
                          agency:
                            customer.name == 'Bayer Dealer Bucket'
                              ? 'GLN'
                              : customer.glnId !== null
                              ? 'GLN'
                              : 'AssignedBySeller',
                          addressInformation: {
                            city: customer.businessCity || '',
                            state: customer.businessState || 'NE',
                            postalCode: customer.businessZip || '10000',
                            postalCountry: 'US', //TODO: ask sourabh
                            address: customer.deliveryAddress || '',
                          },
                        },
                        products: await getProducts(),
                        seedCompanyId: monsantoUserData.dataValues.id,
                        orderReference: hasSalesOrderReference.PurchaseOrder.salesOrderReference,
                      },
                    ],
                    organizationName: organization.name,
                    seedDealerMonsantoId: monsantoUserData.dataValues.glnId,
                    res,
                    isDealerBucket: false,
                    monsantoUserData,
                    organizationAddress,
                    organizationBusinessCity,
                    organizationBusinessState,
                    organizationBusinessZip,
                  };
                }
                try {
                  const xmlStringRequest = await makeProductBookingRequest(monsantoRequest);

                  const response = await request.post(config.monsantoEndPoint, {
                    'content-type': 'text/plain',
                    body: xmlStringRequest,
                  });
                  const responseString = await parseXmlStringPromise(response);

                  // const rawResponseData = bayerAPIDown === 'true' ? hardCodeResponse : responseString;
                  const monsantoResponse = await parseProductBookingResponse(responseString);
                  const {
                    properties: { crossRefIdentifier, responseStatus },
                    details,
                    impactSummary,
                  } = monsantoResponse;

                  monsantoReqLogCreator({
                    req,
                    userName: customer.name + '(' + customer.id + ')',
                    type: 'product booking(new)',
                    uuid: monsantoResponse.uuid,
                    description: JSON.stringify(responseStatus),
                  });

                  const { errorMsg, warningMsg, isError } = parseProductBookingError(responseStatus, details);
                  if (isError) throw errorMsg; // generates an exception
                  if (warningMsg) msg = warningMsg;

                  //update Customer bayer Product
                  await Promise.all(
                    details.map(async (detail) => {
                      const customerMonsantoProductDetail = orders.find(
                        (order) =>
                          parseInt(order.lineItemNumber, 10) === parseInt(detail.productBookingLineItemNumber, 10) &&
                          order.MonsantoProduct.crossReferenceId === detail.identification.identifier,
                      );
                      const customerMonsantoProduct =
                        customerMonsantoProductDetail &&
                        (await CustomerMonsantoProduct.findOne({ where: { id: customerMonsantoProductDetail.id } }));

                      await PurchaseOrder.update(
                        { salesOrderReference: crossRefIdentifier },
                        { where: { id: customerMonsantoProduct.dataValues.purchaseOrderId } },
                      );

                      await customerMonsantoProduct
                        .update({
                          lineNumber: detail.lineNumber,
                          lineItemNumber: detail.productBookingLineItemNumber,
                          unit: detail.quantity.unit,
                          monsantoOrderQty: parseFloat(detail.quantity.value, 10),
                          unit: detail.quantity.unit,
                          isSent: true,
                          isDeleted: parseFloat(detail.quantity.value, 10) == 0 ? true : false,
                          isDeleteSynced:
                            (customerMonsantoProductDetail.orderQty === 0 && customerMonsantoProductDetail.isDeleted) ||
                            parseFloat(detail.quantity.value, 10) == 0
                              ? true
                              : false,
                        })
                        .then(async (customerMonsantoProduct) => {
                          const monsantoProduct = await MonsantoProduct.findById(
                            customerMonsantoProduct.dataValues.monsantoProductId,
                          );

                          customerMonsantoProduct.dataValues &&
                            transferLog({
                              req,
                              productName: monsantoProduct.dataValues.productDetail,
                              action: { synced: `Synced Row with Bayer`, BayerUUID: monsantoResponse.uuid },
                              otherDetail: { BayerStatus: 'synced Done' },
                              purchaseOrderId: customerMonsantoProduct.dataValues.purchaseOrderId,
                              productId: customerMonsantoProduct.dataValues.monsantoProductId,
                              rowId: customerMonsantoProduct.dataValues.id,
                            });
                        });
                    }),
                  );

                  return res.status(200).json({ synced: true, msg: msg });
                } catch (error) {
                  console.log(error, 'error');
                  orders.map(async (customerMonsantoProduct) => {
                    const errorXmL = error.response && (await parseXmlStringPromise(error.response.body));
                    const errorString = errorXmL && parseMainProductBookingError(errorXmL);
                    const monsantoProduct = await MonsantoProduct.findById(
                      customerMonsantoProduct.dataValues.monsantoProductId,
                    );
                    customerMonsantoProduct &&
                      transferLog({
                        req,
                        productName: monsantoProduct.dataValues.productDetail,
                        action: { synced: `Synced Row with Bayer` },
                        otherDetail: {
                          BayerStatus: 'synced UnSuccessfull',
                          error: error.response ? errorString : `Error syncing summary: ${error}`,
                        },
                        purchaseOrderId: customerMonsantoProduct.dataValues.purchaseOrderId,
                        productId: customerMonsantoProduct.dataValues.monsantoProductId,
                        rowId: customerMonsantoProduct.dataValues.id,
                      });
                  });

                  if (error.response !== undefined) {
                    const errorXmL = await parseXmlStringPromise(error.response.body);
                    const errorString = parseMainProductBookingError(errorXmL);

                    return res
                      .status(503)
                      .json({ error: errorString || 'something wrong with the api for now!', synced: false });
                  } else {
                    console.log(`Error syncing retailer order summary: ${error}`);

                    return res.status(503).json({
                      error: `Error syncing : ${error}` || 'something wrong with the api for now!',
                      synced: false,
                    });
                  }
                }
              }
            }, i * 5000);
          });
        } catch (e) {
          console.log(e, 'e');
        }
      }),
  );
};

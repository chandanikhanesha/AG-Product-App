const { Router } = require('express');
const request = require('request-promise');
const config = require('config').getConfig();
const Sequelize = require('sequelize');
const authMiddleware = require('middleware/userAuth');

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

const {
  CustomerMonsantoProduct,
  Customer,
  MonsantoProduct,
  ApiSeedCompany,
  Organization,
  MonsantoProductLineItem,
  PurchaseOrder,
  ReturnAllProduct,
} = require('models');

const { create: monsantoReqLogCreator } = require('../middleware/monsantoReqLogCreator');
const router = (module.exports = Router().use(authMiddleware));
const { filterDeletedListResponse } = require('utilities');
// const { calculateSeedYear } = require('../utilities/xml/common');

router.get('/', (req, res) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
      isDeleted: false,
    },
  };
  ReturnAllProduct.all(query)
    .then((Products) => res.json(Products))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching ReturnAllProduct' });
    });
});

router.post('/returnData', async (req, res) => {
  const organizationId = req.user.organizationId;
  let {
    purchaseOrderId,
    customerId,
    customerProductId,
    farmId,
    productId,
    monsantoProductId,
    orderQty,
    customProductId,
    unit,
    msrpEdited,
    discounts,
    orderDate,
    price,
    comment,
    fieldName,
    isSent,
  } = req.body.data;

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

  ReturnAllProduct.create({
    purchaseOrderId: purchaseOrderId,
    customerId: customerId,
    farmId: farmId ? farmId : null,
    organizationId: organizationId,
    productId: productId || null,
    monsantoProductId: monsantoProductId || null,
    returnOrderQty: orderQty,
    customProductId: customProductId || null,
    customerProductId: customerProductId,
    // unit,
    lineNumber,
    lineItemNumber,
    discounts,
    orderDate,
    comment,
    fieldName,
    msrpEdited: msrpEdited,
    monsantoOrderQty: isSent ? orderQty : null,
    isSent: isSent ? isSent : false,
    isReplant: po ? po.isReplant : false,
  })
    .then(async (customerProduct) => {
      return res.json(customerProduct);
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error creating bayer customer product' });
    });
});

router.patch('/:id', async (req, res) => {
  const { monsantoProductId } = req.body;

  const syncMonsantoProductIds = [];
  let msg = 'Successfully updated!';

  //finished code

  const { farmId, shareholderData, discounts } = req.body;
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
});

router.delete('/', async (req, res) => {
  let customerProductId = req.params.id;
  const { seedDealerMonsantoId, seedCompanyId, organizationName } = req.body;

  const customer = await Customer.findOne({
    where: {
      monsantoTechnologyId: seedDealerMonsantoId,
      isArchive: false,
    },
  });

  //   const organization = await Organization.findById(req.user.organizationId);

  //   CustomerMonsantoProduct.findOne({
  //     where: {
  //       organizationId: req.user.organizationId,
  //       id: customerProductId,
  //       // isSent: true
  //     },
  //     include: [
  //       {
  //         model: MonsantoProduct,
  //         include: [{ model: MonsantoProductLineItem, as: 'LineItem' }],
  //       },
  //     ],
  //   })
  //     .then(async (customerProduct) => {
  //       if (customer && customer.dataValues) {
  //         // const monsantoUserData = await ApiSeedCompany.findOne({
  //         //   where: { organizationId: req.user.organizationId }
  //         // });
  //         // const monsantoRequest = {
  //         //   orders: [
  //         //     {
  //         //       orderType: "Changed",
  //         //       orderNumber: customerProduct.dataValues.purchaseOrderId,
  //         //       productYear: calculateSeedYear(),
  //         //       directShip: 0,
  //         //       issuedDate: x2,
  //         //       shipTo: {
  //         //         name:
  //         //           customer.dataValues.organizationName ||
  //         //           customer.dataValues.name,
  //         //         identifier: customer.dataValues.glnId,
  //         //         agency: "GLN",
  //         //         addressInformation: {
  //         //           city: customer.dataValues.businessCity || "",
  //         //           state: customer.dataValues.businessState || "NE",
  //         //           postalCode: customer.dataValues.businessZip || "10000",
  //         //           postalCountry: "US",
  //         //           address:
  //         //             customer.dataValues.deliveryAddress || ""
  //         //         }
  //         //       },
  //         //       orderReference: customerProduct.dataValues.salesOrderReference,
  //         //       products: [
  //         //         {
  //         //           lineNumber: customerProduct.dataValues.lineNumber || "999999",
  //         //           lineItemNumber: customerProduct.dataValues.lineItemNumber,
  //         //           action: "Delete",
  //         //           requestedDate:
  //         //             customer.dataValues.requestedDate ||
  //         //             x2,
  //         //           crossReferenceProductId:
  //         //             customerProduct.dataValues.MonsantoProduct.crossReferenceId,
  //         //           increaseOrDecrease: {
  //         //             type: "Decrease",
  //         //             unit: customerProduct.dataValues.unit,
  //         //             value: customerProduct.dataValues.orderQty
  //         //           },
  //         //           quantity: {
  //         //             value: 0,
  //         //             unit: customerProduct.dataValues.unit
  //         //           },
  //         //           orderQty: customerProduct.dataValues.orderQty,
  //         //           monsantoOrderQty: customerProduct.dataValues.monsantoOrderQty,
  //         //           requestedShipDate: new Date(
  //         //             +new Date() + 60 * 60 * 24 * 7
  //         //           ).toISOString(), // ASK sourabh
  //         //           isDeleted: customerProduct.dataValues.isDeleted,
  //         //           lineItem: customerProduct.dataValues.MonsantoProduct.LineItem
  //         //         }
  //         //       ],
  //         //       seedCompanyId
  //         //     }
  //         //   ],
  //         //   organizationName,
  //         //   seedDealerMonsantoId,
  //         //   res,
  //         //   isDealerBucket: customer.dataValues.name.includes(
  //         //     "Bayer Dealer Bucket"
  //         //   )
  //         //     ? true
  //         //     : false,
  //         //   monsantoUserData,
  //         //   organizationAddress,
  //         //   organizationBusinessCity,
  //         //   organizationBusinessState,
  //         //   organizationBusinessZip,
  //         // };
  //         // const xmlStringRequest = await makeProductBookingRequest(
  //         //   monsantoRequest
  //         // );
  //         // const response = await request.post(config.monsantoEndPoint, {
  //         //   "content-type": "text/plain",
  //         //   body: xmlStringRequest
  //         // });
  //         // const responseString = await parseXmlStringPromise(response);
  //         // const monsantoResponse = await parseProductBookingResponse(
  //         //   responseString
  //         // );
  //         // if (monsantoResponse) {
  //         //   monsantoReqLogCreator({
  //         //     req,
  //         //     userName:customer.dataValues.name+"("+customer.dataValues.id+")",
  //         //     type: "product booking delete",
  //         //     uuid: monsantoResponse.uuid,
  //         //   });
  //         // }
  //         // const { properties } = monsantoResponse;
  //         // if (properties[`responseStatus`] === "E") {
  //         //   throw new Error(`${properties.responseStatus[`description`]}`);
  //         // } else {
  //         //   customerProduct.update({ orderQty: 0, isDeleted: true });
  //         // }
  //         if (customerProduct.dataValues.monsantoOrderQty <= 0) {
  //           customerProduct.update({ orderQty: 0, isDeleted: true });
  //         } else {
  //           customerProduct.update({ orderQty: 0, isSent: false });
  //         }
  //         DiscountReport.update(
  //           { isLoad: true },
  //           { where: { purchaseOrderId: customerProduct.dataValues.purchaseOrderId } },
  //         );
  //       } else {
  //         customerProduct.update({ orderQty: 0, isDeleted: true });
  //       }
  //       if (customerProduct.dataValues.monsantoOrderQty <= 0) {
  //         customerProduct.update({ orderQty: 0, isDeleted: true });
  //       } else {
  //         customerProduct.update({ orderQty: 0, isSent: false });
  //       }
  //       DiscountReport.update(
  //         { isLoad: true },
  //         { where: { purchaseOrderId: customerProduct.dataValues.purchaseOrderId } },
  //       );
  //     })
  //     .then(async () => {
  //       const customerProduct = await CustomerMonsantoProduct.findOne({
  //         where: {
  //           organizationId: req.user.organizationId,
  //           id: customerProductId,
  //           // isSent: true
  //         },
  //       });
  //       const monsantoProduct = await MonsantoProduct.findById(customerProduct.dataValues.monsantoProductId);

  //       transferLog({
  //         req,
  //         productName: monsantoProduct.dataValues.productDetail,
  //         action: { DeletedRow: 'Deleted record successfully' },
  //         otherDetail: {
  //           Staus: 'Done',
  //         },
  //         purchaseOrderId: customerProduct.dataValues.purchaseOrderId,
  //         productId: customerProduct.dataValues.monsantoProductId,
  //         rowId: customerProductId,
  //       });

  //       res.json({ ok: 'ok' });
  //     })
  //     .catch((e) => {
  //       console.log('error...: ', e);
  //       res.status(422).json({ error: 'Error deleting customer MonsantoProduct product' });
  //     });
});

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
    // return res.status(503).json({ error: 'Something happened when processing your request' });
  }
}

router.get('/last_update', (req, res) => {
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
});

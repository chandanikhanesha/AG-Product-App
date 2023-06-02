const request = require('request-promise');
const config = require('config').getConfig();

const {
  retailOrder: { buildRetailOrderSummaryRequest, parseRetailOrderSummaryResponse },
  productBookingSummary: { buildProductBookingSummaryRequest, parseProductBookingSummaryResponse },
  common: { parseXmlStringPromise, parseRetailOrderSummaryError },
} = require('utilities/xml');
const { Op } = require('sequelize');
const emailUtility = require('utilities/email');

const {
  MonsantoProductLineItem,
  MonsantoProduct,
  MonsantoPriceSheet,
  MonsantoRetailerOrderSummary,
  MonsantoRetailerOrderSummaryProduct,
  ApiSeedCompany,
  sequelize,
  Organization,
  PurchaseOrder,
  Customer,
  CustomerMonsantoProduct,
  MonsantoProductBookingSummaryProducts,
  MonsantoLot,
} = require('models');
const _ = require('lodash');
const { fetchPriceSheet } = require('controllers/MonsantoPriceSheetController');
const { calculateSeedYear } = require('../utilities/xml/common');

const syncRetailerOrderSummary = async ({ user, seedDealerMonsantoId }) => {
  const orderDetails = [];
  const monsantoUserData = await ApiSeedCompany.findOne({
    where: { organizationId: user.organizationId },
  });
  const retailOrderSummaryRequest = await buildRetailOrderSummaryRequest({
    user,
    seedDealerMonsantoId,
    monsantoUserData,
  });
  const xmlResponse = await request.post(config.monsantoEndPoint, {
    'content-type': 'text/plain',
    body: retailOrderSummaryRequest,
  });

  const parsedResponse = await parseXmlStringPromise(xmlResponse);
  const response = await parseRetailOrderSummaryResponse(parsedResponse);

  const { sellerMonsantoId, buyerMonsantoId, productClassification, zoneId, lastRequestDate } = response;
  orderDetails.push(...response.OrderDetails);
  let summaryJustCreated;
  const transaction = await sequelize.transaction();
  try {
    const [summary, _justCreated] = await MonsantoRetailerOrderSummary.findOrCreate({
      where: { sellerMonsantoId, buyerMonsantoId, productClassification },
      defaults: {
        currencyCode: response.CurrencyCode,
        languageCode: response.LanguageCode,
        lastRequestDate,
        zoneId,
        productClassification,
        buyerMonsantoId,
        sellerMonsantoId,
      },
    });
    summaryJustCreated = _justCreated;
    let emaildata = [];
    const batchProductCreation = orderDetails.map((product) => {
      return MonsantoProduct.findOne({
        where: { crossReferenceId: product.productIdentification, organizationId: user.organizationId },
      }).then((monsantoProduct) => {
        if (monsantoProduct) {
          return MonsantoRetailerOrderSummaryProduct.upsert(
            {
              productId: monsantoProduct.dataValues.id,
              summaryId: summary.id,
              lineNumber: product.lineNumber[0],
              totalRetailerProductQuantityValue: parseFloat(product.totalRetailerProductQuantity.measurementValue),
              totalRetailerProductQuantityCode: product.totalRetailerProductQuantity.unitOfMeasureCode,
              shippedQuantityValue: parseFloat(product.shippedQuantity.measurementValue),
              shippedQuantityCode: product.shippedQuantity.unitOfMeasureCode,
              scheduledToShipQuantityValue: parseFloat(product.scheduledToShipQuantity.measurementValue),
              scheduledToShipQuantityCode: product.scheduledToShipQuantity.unitOfMeasureCode,
              balanceToShipQuantityValue: parseFloat(product.balanceToShipQuantity.measurementValue),
              balanceToShipQuantityCode: product.balanceToShipQuantity.unitOfMeasureCode,
              positionQuantityValue: parseFloat(product.positionQuantity.measurement.measurementValue),
              positionQuantityCode: product.positionQuantity.measurement.unitOfMeasureCode,
              positionQuantityStatus: product.positionQuantity.longShortPositionType,
              transfersInQuantityValue: parseFloat(product.transfersInQuantity.measurementValue),
              transfersInQuantityCode: product.transfersInQuantity.unitOfMeasureCode,
              transfersOutQuantityValue: parseFloat(product.transfersOutQuantity.measurementValue),
              transfersOutQuantityCode: product.transfersOutQuantity.unitOfMeasureCode,
              returnsQuantityValue: parseFloat(product.returnsQuantity.measurementValue),
              returnsQuantityCode: product.returnsQuantity.unitOfMeasureCode,
            },
            {
              transaction,
            },
          );
        } else if (monsantoProduct === null) {
          emaildata.push(product.productIdentification);

          return Promise.resolve();
        }
      });
    });
    const confirmSync = MonsantoRetailerOrderSummary.update({ isSynced: true }, { where: { id: summary.id } });
    await Promise.all([summary.id, confirmSync, ...batchProductCreation]);
    await transaction.commit();
    let retailerOrderSummary = await MonsantoRetailerOrderSummary.findOne({
      where: { buyerMonsantoId: seedDealerMonsantoId },
    });

    // If products exist in AD DB table BUT NOT in ROS response, we need to update their quantities to 0
    const allReatilerBookingsummaryProduct = await MonsantoRetailerOrderSummaryProduct.all({
      // where: {
      //   organizationId: user.organizationId,
      // },
      include: [
        {
          model: MonsantoProduct,
          as: 'Product',
        },
      ],
      raw: true,
    });
    await Promise.all(
      allReatilerBookingsummaryProduct.map(async (product) => {
        let isFound = false;
        orderDetails.map((resPO) => {
          if (product['Product.crossReferenceId'] === resPO.productIdentification) {
            isFound = true;
          }
        });
        if (!isFound) {
          console.log('product.productId', product.productId, 'isFound', isFound);
          await MonsantoRetailerOrderSummaryProduct.update(
            {
              supply: 0,
              totalRetailerProductQuantityValue: 0,
            },
            { where: { productId: product.productId } },
          );
        }
      }),
    );

    emaildata.length > 0 &&
      emailUtility.sendEmail(
        'dev@agridealer.co',
        'Product Not Found Email',
        `Below Product is not found in RetailOrderSummaryRequest`,
        `<p>Below Product is not found in RetailOrderSummaryRequest</p><br></br>${emaildata.map((data) => {
          return `<p>The product name/detail , the Bayer product ID ${data} , and the organizationId is ${user.organizationId}  </p>`;
        })}`,
        null,
      );

    return retailerOrderSummary;
  } catch (err) {
    console.log(err, 'err');
    if (summaryJustCreated) {
      await MonsantoRetailerOrderSummary.destroy({
        where: { sellerMonsantoId, buyerMonsantoId },
      });
    }
    await transaction.rollback();
    throw err;
  }
};

module.exports.syncRetailerOrderSummary = syncRetailerOrderSummary;

async function getAllRetailOrderSummary({ seedCompany, user }) {
  const seedDealerMonsantoId = seedCompany.dataValues.technologyId;
  const summary = await MonsantoRetailerOrderSummary.findOne({
    where: {
      buyerMonsantoId: seedDealerMonsantoId,
    },
  });

  // we will find all the monsantoproduct for particular cropType
  let cropProducts = await MonsantoProduct.findAll({
    where: {
      organizationId: user.organizationId,
    },
    attributes: ['id'],
  });
  cropProducts = cropProducts.map((item) => item.id);
  let summaryId;
  if (!summary || !summary.dataValues.isSynced) {
    const result = await syncRetailerOrderSummary({
      user,
      seedDealerMonsantoId,
    });
    summaryId = result[0];
  } else {
    summaryId = summary.dataValues.id;
  }

  const retailerSummarydata = await MonsantoRetailerOrderSummaryProduct.findAll({
    where: {
      summaryId: summaryId,
      productId: { [Op.in]: cropProducts },
    },
    include: [
      {
        model: MonsantoProduct,
        as: 'Product',

        include: [
          {
            model: MonsantoProductLineItem,
            as: 'LineItem',
          },
          {
            model: MonsantoLot,
            as: 'monsantoLots',
          },
        ],
      },
    ],
  });

  const productBookingSummaryData = await MonsantoProductBookingSummaryProducts.findAll({
    where: {
      organizationId: user.organizationId,
      productId: { [Op.in]: cropProducts },
    },
    include: [
      {
        model: MonsantoProduct,
        as: 'Product',

        include: [
          {
            model: MonsantoProductLineItem,
            as: 'LineItem',
          },
        ],
      },
    ],
  });

  const retailOrderSummaryLasySyncDate = summary.dataValues.updatedAt;

  let retailProductIdList = retailerSummarydata.map((item) => item.dataValues.productId);
  let productSummaryIdList = productBookingSummaryData.map((item) => item.dataValues.productId);
  const commonProductList = [];
  retailProductIdList &&
    retailProductIdList.map((productId) => {
      if (productSummaryIdList.includes(productId)) {
        commonProductList.push(productId);
      } else {
        console.log('not found in product summary', productId);
      }
    });

  const responseProductList = [];

  retailerSummarydata.map((retailProduct) => {
    if (commonProductList.includes(retailProduct.dataValues.productId)) {
      productBookingSummaryData.map((productBooking) => {
        // this will add common products to final product list
        if (productBooking.dataValues.productId === retailProduct.dataValues.productId) {
          responseProductList.push({
            ...retailProduct.dataValues,
            bayerDealerBucketQty: productBooking.dataValues.bayerDealerBucketQty,
            allGrowerQty: productBooking.dataValues.allGrowerQty,
            isChanged: productBooking.dataValues.isChanged,
            demand:
              parseFloat(productBooking.dataValues.allGrowerQty, 10) +
              parseFloat(productBooking.dataValues.bayerDealerBucketQty, 10),
            organizationId: productBooking.dataValues.organizationId,
            retailOrderSummaryLasySyncDate,
          });
        }
      });
    } else {
      // if there is something in retailordersummary that is not common will be added by this code
      responseProductList.push({
        ...retailProduct.dataValues,
        bayerDealerBucketQty: 0,
        allGrowerQty: 0,
        demand: 0,
        retailOrderSummaryLasySyncDate,
      });
    }
  });

  // now we have added all the data of retailordersummary

  // for product booking summmary we have to add only those product that are not common to retailordersummary
  //   with supply 0

  productBookingSummaryData.map((productBooking) => {
    if (!commonProductList.includes(productBooking.dataValues.productId)) {
      // here I am adding all the product that are not common with retail ordersummary
      responseProductList.push({
        ...productBooking.dataValues,
        demand:
          parseFloat(productBooking.dataValues.allGrowerQty, 10) +
          parseFloat(productBooking.dataValues.bayerDealerBucketQty, 10),
        supply: 0,
        retailOrderSummaryLasySyncDate,
      });
    }
  });

  return responseProductList;
}

async function getRetailOrderSummary({ seedCompany, cropType, user, zoneId }) {
  const seedDealerMonsantoId = seedCompany.dataValues.technologyId;
  const summary = await MonsantoRetailerOrderSummary.findOne({
    where: {
      buyerMonsantoId: seedDealerMonsantoId,
    },
  });

  // we will find all the monsantoproduct for particular cropType
  let cropProducts = await MonsantoProduct.findAll({
    where: {
      classification: cropType,
      organizationId: user.organizationId,
    },
    attributes: ['id'],
  });
  cropProducts = cropProducts.map((item) => item.id);
  let summaryId;
  if (!summary || !summary.dataValues.isSynced) {
    const result = await syncRetailerOrderSummary({
      user,
      seedDealerMonsantoId,
    });
    summaryId = result[0];
  } else {
    summaryId = summary.dataValues.id;
  }

  const retailerSummarydata = await MonsantoRetailerOrderSummaryProduct.findAll({
    where: {
      summaryId: summaryId,
      productId: { [Op.in]: cropProducts },
    },
    include: [
      {
        model: MonsantoProduct,
        as: 'Product',
        where: {
          classification: cropType,
        },
        include: [
          {
            model: MonsantoProductLineItem,
            as: 'LineItem',
          },
          {
            model: MonsantoLot,
            as: 'monsantoLots',
          },
        ],
      },
    ],
  });

  const productBookingSummaryData = await MonsantoProductBookingSummaryProducts.findAll({
    where: {
      organizationId: user.organizationId,
      productId: { [Op.in]: cropProducts },
      crossReferenceId: {
        [Op.not]: null, // Like: sellDate IS NOT NULL
      },
    },
    include: [
      {
        model: MonsantoProduct,
        as: 'Product',
        where: {
          classification: cropType,
        },
        include: [
          {
            model: MonsantoProductLineItem,
            as: 'LineItem',
          },
        ],
      },
    ],
  });

  const retailOrderSummaryLasySyncDate = summary.dataValues.updatedAt;

  let retailProductIdList = retailerSummarydata.map((item) => item.dataValues.productId);
  let productSummaryIdList = productBookingSummaryData.map((item) => item.dataValues.productId);
  const commonProductList = [];
  retailProductIdList &&
    retailProductIdList.map((productId) => {
      if (productSummaryIdList.includes(productId)) {
        commonProductList.push(productId);
      } else {
        console.log('not found in product summary', productId);
      }
    });
  // &&
  // !responseProductList.find(
  //   (p) => p.productId == productBooking.dataValues.productId && p.id == retailProduct.dataValues.id,
  // )
  const responseProductList = [];

  retailerSummarydata.map((retailProduct) => {
    if (commonProductList.includes(retailProduct.dataValues.productId)) {
      productBookingSummaryData.map((productBooking) => {
        // this will add common products to final product list
        if (productBooking.dataValues.productId === retailProduct.dataValues.productId) {
          responseProductList.push({
            ...retailProduct.dataValues,
            bayerDealerBucketQty: productBooking.dataValues.bayerDealerBucketQty,
            allGrowerQty: productBooking.dataValues.allGrowerQty,
            isChanged: productBooking.dataValues.isChanged,
            demand:
              parseFloat(productBooking.dataValues.allGrowerQty, 10) +
              parseFloat(productBooking.dataValues.bayerDealerBucketQty, 10),
            organizationId: productBooking.dataValues.organizationId,
            retailOrderSummaryLasySyncDate,
          });
        }
      });
    } else {
      // if there is something in retailordersummary that is not common will be added by this code
      responseProductList.push({
        ...retailProduct.dataValues,
        bayerDealerBucketQty: 0,
        allGrowerQty: 0,
        demand: 0,

        retailOrderSummaryLasySyncDate,
      });
    }
  });

  // now we have added all the data of retailordersummary

  // for product booking summmary we have to add only those product that are not common to retailordersummary
  //   with supply 0

  productBookingSummaryData.map((productBooking) => {
    if (!commonProductList.includes(productBooking.dataValues.productId)) {
      // here I am adding all the product that are not common with retail ordersummary
      responseProductList.push({
        ...productBooking.dataValues,
        demand:
          parseFloat(productBooking.dataValues.allGrowerQty, 10) +
          parseFloat(productBooking.dataValues.bayerDealerBucketQty, 10),
        supply: 0,
        retailOrderSummaryLasySyncDate,
      });
    }
  });

  return responseProductList;
}

module.exports.allSummary = async (req, res) => {
  try {
    const { seedCompanyId } = req.params;

    console.log(seedCompanyId, 'seedCompanyId');
    let seedCompany = await ApiSeedCompany.findOne({
      attributes: ['technologyId', 'zoneIds'],
      where: {
        id: seedCompanyId,
      },
    });
    if (!seedCompany) {
      return res.sendStatus(422);
    } else {
      const { technologyId: seedDealerMonsantoId, zoneIds: zoneIdsJSON } = seedCompany.dataValues;

      const zoneIds = JSON.parse(zoneIdsJSON);
      const priceSheet = await MonsantoPriceSheet.getSyncStatus({
        buyerMonsantoId: seedDealerMonsantoId,
      });
      // let isSyncing = !priceSheet || (priceSheet && priceSheet.dataValues.isSyncing);
      // console.log(isSyncing, 'isSyncing');
      // if (!isSyncing) {
      try {
        const summary = await getAllRetailOrderSummary({
          seedCompany,

          user: req.user,
        });
        return res.json({ items: summary });
      } catch (error) {
        throw error;
      }
      // } else {
      //   return res.status(422).json({ error: 'pricesheet still syncing' });
      // }
    }
  } catch (error) {
    console.log(error, 'error from all retail data');
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      if (parseRetailOrderSummaryError(errorXmL) === 'No data found') {
        console.log(`Error syncing retailer order summary: No data found`);
        return res.status(200).json({ items: [] });
      }
    } else {
      console.log(`Error syncing all retailer order summary: ${error}`);
      return res.status(503).json({ error: 'Error' });
    }
  }
};

module.exports.summary = async (req, res) => {
  try {
    const { cropType, seedCompanyId, zoneId } = req.query;
    let seedCompany = await ApiSeedCompany.findOne({
      attributes: ['technologyId', 'zoneIds'],
      where: {
        id: seedCompanyId,
      },
    });
    if (!seedCompany) {
      return res.sendStatus(422);
    } else {
      const { technologyId: seedDealerMonsantoId, zoneIds: zoneIdsJSON } = seedCompany.dataValues;

      const zoneIds = JSON.parse(zoneIdsJSON);
      const priceSheet = await MonsantoPriceSheet.getSyncStatus({
        buyerMonsantoId: seedDealerMonsantoId,
      });
      // let isSyncing = !priceSheet || (priceSheet && priceSheet.dataValues.isSyncing);
      // console.log(isSyncing, 'isSyncing');
      // if (!isSyncing) {
      try {
        const summary = await getRetailOrderSummary({
          seedCompany,
          cropType,
          user: req.user,
          zoneIds,
        });
        return res.json({ items: summary });
      } catch (error) {
        throw error;
      }
      // } else {
      //   return res.status(422).json({ error: 'pricesheet still syncing' });
      // }
    }
  } catch (error) {
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      if (parseRetailOrderSummaryError(errorXmL) === 'No data found') {
        console.log(`Error syncing retailer order summary: No data found`);
        return res.status(200).json({ items: [] });
      }
    } else {
      console.log(`Error syncing retailer order summary: ${error}`);
      return res.status(503).json({ error: 'Error' });
    }
  }
};

module.exports.custometestsummary = async (req, res) => {
  try {
    const { seedDealerMonsantoId } = req.query;
    const monsantoUserData = await ApiSeedCompany.findOne({
      where: { organizationId: req.user.organizationId },
    });
    const retailOrderSummaryRequest = await buildRetailOrderSummaryRequest({
      user: req.user,
      seedDealerMonsantoId,
      monsantoUserData,
    });
    const xmlResponse = await request.post(config.monsantoEndPoint, {
      'content-type': 'text/plain',
      body: retailOrderSummaryRequest,
    });
    const parsedResponse = await parseXmlStringPromise(xmlResponse);
    const response = await parseRetailOrderSummaryResponse(parsedResponse);
    res.send(response);
    // res.send(retailOrderSummaryRequest);
  } catch (error) {
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      if (parseRetailOrderSummaryError(errorXmL) === 'No data found') {
        console.log(`No data found`);
        return res.send({ response: {} });
      }
    } else {
      console.log('test', e);
      res.status(503).send(e.message || e);
    }
  }
};

module.exports.setQuantity = async (req, res) => {
  try {
    const { type } = req.body;
    res.send({
      status: true,
      statusCode: 200,
      message: 'get selected type',
      data: type,
    });
    // res.send(retailOrderSummaryRequest);
  } catch (e) {
    console.log('test', e);
    res.status(503).send(e.message || e);
  }
};

function fetchSeedDealerPriceSheets({ zoneIds, user, seedDealerMonsantoId, seedCompanyId }) {
  //TODO: convert into for await ... of if we update the container to Node >10

  const fetchPriceSheetPromises = zoneIds.map((obj) => {
    return fetchPriceSheet({
      user,
      cropType: obj.classification,
      zoneId: obj.zoneId,
      seedDealerMonsantoId,
      seedCompanyId,
    });
  });
  Promise.all(fetchPriceSheetPromises)
    .then(() => {
      //TODO: set synced
      console.log('pricesheet synced');
    })
    .catch(console.log);
}

//TODO: implement a better way to check it
module.exports.getLastUpdate = (req, res) => {
  MonsantoProduct.all({
    where: { organizationId: req.user.organizationId },
    order: [['updatedAt', 'DESC']],
    limit: 1,
  })
    .then((products) => {
      let lastUpdate = (products[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => res.status(422).json({ errors: 'Error getting last update' }));
};

module.exports.syncSummaryData = async (req, res) => {
  const { seedCompanyId } = req.query || req;
  try {
    const seedCompany = await ApiSeedCompany.findOne({
      attributes: ['technologyId', 'zoneIds'],
      where: {
        id: seedCompanyId,
      },
    });
    if (!seedCompany) {
      return res.sendStatus(422);
    } else {
      console.log('syncSummaryData', seedCompanyId);
      const { technologyId: seedDealerMonsantoId } = seedCompany.dataValues;
      await syncRetailerOrderSummary({ seedDealerMonsantoId: seedDealerMonsantoId, user: req.user });
      return res !== undefined && res.status(200).json({ status: true, response: [], update: true });
    }
  } catch (error) {
    console.log(error, 'error');
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      // here exception parse for both retail order summary and product bookingsummary is same that is
      //  why the parseReatilOrderSummaryError is written there
      if (parseRetailOrderSummaryError(errorXmL) === 'No data found') {
        res.status(200).json({ status: true, response: {}, update: false });
      } else {
        emailUtility.sendEmail(
          'support@agridealer.app',
          'syncInventory cron job fail for RetailOrderSummaryRequest',
          `SyncInventory fail for seedCompanyId-${seedCompanyId} and error was ${error}`,
          null,
          null,
        );
      }
    } else {
      console.log(`Error syncing product booking order summary: ${error}`);
      emailUtility.sendEmail(
        'support@agridealer.app',
        'syncInventory cron job fail for RetailOrderSummaryRequest',
        `SyncInventory fail for seedCompanyId-${seedCompanyId} and error was ${error}`,
        null,
        null,
      );
      res !== undefined && res.status(503).json({ error: 'Something went wrong!' });
      // console.log('eee.....: ', e);
    }
  }
};

// module.exports.bayer_order_check = async (req, res) => {
//   try {
//     const responseData = []; //{ customerName: 'ds', customerId: '21', comment: 'a', poID: 'SD' }
//     const seedCompany = await ApiSeedCompany.findOne({
//       attributes: ['technologyId', 'zoneIds'],
//       where: {
//         organizationId: req.user.organizationId,
//       },
//     });
//     const organization = await Organization.findById(req.user.organizationId);
//     const organizationAddress = organization.dataValues.address;
//     const organizationBusinessCity = organization.dataValues.businessCity;
//     const organizationBusinessState = organization.dataValues.businessState;
//     const organizationBusinessZip = organization.dataValues.businessZip;
//     const x = new Date().toISOString().split('Z');
//     const x1 = x[0].split('.');
//     const x2 = x1[0] + '-05:00';
//     const purchaseOrderList = await CustomerMonsantoProduct.all({
//       where: {
//         organizationId: req.user.organizationId,
//         isDeleted: false,
//         isSent: true,
//       },
//       include: [
//         {
//           model: PurchaseOrder,
//           include: [
//             {
//               model: Customer,
//             },
//           ],
//         },
//       ],
//       raw: true,
//     });

//     if (!seedCompany) {
//       return res.sendStatus(422);
//     } else {
//       const { technologyId: seedDealerMonsantoId } = seedCompany.dataValues;
//       const monsantoUserData = await ApiSeedCompany.findOne({
//         where: { organizationId: req.user.organizationId },
//       });
//       const productSummaryRequest = await buildProductBookingSummaryRequest({
//         seedDealerMonsantoId,
//         organizationName: organization.name,
//         organizationAddress,
//         organizationBusinessCity,
//         organizationBusinessState,
//         organizationBusinessZip,
//         orders: [
//           {
//             orderNumber: 999999,
//             orderType: 'SummaryRequest',
//             orderReference: 9999999999,
//             directShip: 0,
//             productYear: calculateSeedYear(),
//             issuedDate: x2,
//             products: [],
//             shipTo: {
//               name: organization.dataValues.name, //TODO discusss if organization.dataValues name should be mandatory
//               identifier: seedDealerMonsantoId,
//               agency: 'GLN',
//               addressInformation: {
//                 city: organization.dataValues.businessCity || '',
//                 state: organization.dataValues.businessState || 'NE',
//                 postalCode: organization.dataValues.businessZip || '10000',
//                 postalCountry: 'US', //TODO: ask sourabh
//                 address: organization.dataValues.address || '',
//               },
//             },
//           },
//         ],
//         monsantoUserData,
//       });

//       const xmlResponse = await request.post(config.monsantoEndPoint, {
//         'content-type': 'text/plain',
//         body: productSummaryRequest,
//       });
//       const parsedResponse = await parseXmlStringPromise(xmlResponse);
//       const response = await parseProductBookingSummaryResponse(parsedResponse);

//       response.properties.forEach((reponseOrder) => {
//         const findPurchaseOrder = _.find(purchaseOrderList, {
//           purchaseOrderId: Number(reponseOrder.orderNumber),
//         });

//         if (findPurchaseOrder) {
//           reponseOrder.detail.map((item) => {
//             const isExitInResponseIndex = _.findIndex(responseData, {
//               poID: String(reponseOrder.orderNumber),
//             });
//             if (isExitInResponseIndex !== -1) {
//               responseData[isExitInResponseIndex] = {
//                 customerName: findPurchaseOrder['PurchaseOrder.Customer.name'],
//                 customerId: findPurchaseOrder['PurchaseOrder.Customer.id'],
//                 comment:
//                   responseData[isExitInResponseIndex].comment +
//                   ';' +
//                   `{ ${item.productBookingLineItemNumber}(LineItemNumber) and ${item.lineNumber}(LineNumber) is not found in bayer(${item.identification.identifier}) }`,
//                 poID: String(findPurchaseOrder.purchaseOrderId),
//               };
//             } else {
//               if (
//                 parseInt(findPurchaseOrder.lineItemNumber) === parseInt(item.productBookingLineItemNumber) &&
//                 parseInt(findPurchaseOrder.lineNumber) === parseInt(item.lineNumber)
//               ) {
//                 if (parseInt(item.quantity.value) !== parseInt(findPurchaseOrder.monsantoOrderQty)) {
//                   responseData.push({
//                     customerName: findPurchaseOrder['PurchaseOrder.Customer.name'],
//                     customerId: findPurchaseOrder['PurchaseOrder.Customer.id'],
//                     comment: `{"${item.identification.productName}" : ${item.quantity.value} ${item.quantity.unit} (Bayer) vs ${findPurchaseOrder.monsantoOrderQty} ${findPurchaseOrder.unit} (AD) }`,
//                     poID: String(findPurchaseOrder.purchaseOrderId),
//                   });
//                 }
//               } else {
//                 responseData.push({
//                   customerName: findPurchaseOrder['PurchaseOrder.Customer.name'],
//                   customerId: findPurchaseOrder['PurchaseOrder.Customer.id'],
//                   comment: `{ ${item.productBookingLineItemNumber}(LineItemNumber) and ${item.lineNumber}(LineNumber) is not found in bayer(${item.identification.identifier}) }`,
//                   poID: String(findPurchaseOrder.purchaseOrderId),
//                 });
//               }
//             }
//           });
//         } else {
//           let comment = reponseOrder.detail
//             .map((item) => {
//               return `{"${item.identification.productName}" : ${item.quantity.value} ${item.quantity.unit}}`;
//             })
//             .join('; ');
//           responseData.push({
//             customerName: 'Order is not found In AgriDelaer system',
//             customerId: '',
//             comment: comment,
//             poID: reponseOrder.orderNumber,
//           });
//         }
//       });

//       purchaseOrderList.map((pOrder) => {
//         const findPurchaseOrder = _.find(response.properties, {
//           orderNumber: String(pOrder.purchaseOrderId),
//         });

//         if (findPurchaseOrder) {
//           findPurchaseOrder.detail.map((item) => {
//             const isExitInResponseIndex = _.findIndex(responseData, {
//               poID: String(pOrder.purchaseOrderId),
//             });
//             if (isExitInResponseIndex === -1) {
//               if (
//                 parseInt(pOrder.lineItemNumber) === parseInt(item.productBookingLineItemNumber) &&
//                 parseInt(pOrder.lineNumber) === parseInt(item.lineNumber)
//               ) {
//                 if (parseInt(item.quantity.value) !== parseInt(pOrder.monsantoOrderQty)) {
//                   responseData.push({
//                     customerName: pOrder['PurchaseOrder.Customer.name'],
//                     customerId: pOrder['PurchaseOrder.Customer.id'],
//                     comment: `{"${item.identification.productName}" : ${item.quantity.value} ${item.quantity.unit} (Bayer) vs ${pOrder.monsantoOrderQty} ${pOrder.unit} (AD) ${item.identification.identifier}}`,
//                     poID: String(pOrder.purchaseOrderId),
//                   });
//                 }
//               } else {
//                 responseData.push({
//                   customerName: pOrder['PurchaseOrder.Customer.name'],
//                   customerId: pOrder['PurchaseOrder.Customer.id'],
//                   comment: `{ ${pOrder.lineItemNumber}(LineItemNumber) and ${pOrder.lineNumber}(LineItemNumber) is not found in bayer(${item.identification.identifier})}`,
//                   poID: String(pOrder.purchaseOrderId),
//                 });
//               }
//             }
//           });
//         } else {
//           responseData.push({
//             customerName: pOrder['PurchaseOrder.Customer.name'],
//             customerId: pOrder['PurchaseOrder.Customer.id'],
//             comment: `This order is not found in bayer`,
//             poID: String(pOrder.purchaseOrderId),
//           });
//         }
//       });

//       res.json({ data: responseData });
//     }
//   } catch (error) {
//     if (error.response) {
//       const errorXmL = await parseXmlStringPromise(error.response.body);
//       // here exception parse for both retail order summary and product bookingsummary is same that is
//       //  why the parseReatilOrderSummaryError is written there
//       if (parseRetailOrderSummaryError(errorXmL) === 'No data found') {
//         res.status(200).json({ data: [] });
//       }
//     } else {
//       console.log('eee.....: ', error);
//       res.status(400).send(error);
//     }
//   }
// }

module.exports.bayer_order_check = async (req, res) => {
  console.log(req.query.organizationId, 'req.query.organizationId ');
  try {
    if (req.query.organizationId !== 'all' && req.query.organizationId !== undefined) {
      console.log('hello  org bayerOrderCheck', req.query.organizationId);

      const responseData = []; //{ customerName: 'ds', customerId: '21', comment: 'a', poID: 'SD' }
      const seedCompany = await ApiSeedCompany.findOne({
        where: {
          organizationId: parseInt(req.query.organizationId),
        },
      });

      const organizationId = parseInt(req.query.organizationId);
      const organization = await Organization.findById(organizationId);
      const organizationAddress = organization.dataValues.address;
      const organizationBusinessCity = organization.dataValues.businessCity;
      const organizationBusinessState = organization.dataValues.businessState;
      const organizationBusinessZip = organization.dataValues.businessZip;
      const x = new Date().toISOString().split('Z');
      const x1 = x[0].split('.');
      const x2 = x1[0] + '-05:00';
      const purchaseOrderList = await CustomerMonsantoProduct.all({
        where: {
          organizationId: organizationId,
          isDeleted: false,
          isSent: true,
          isPickLater: false,
        },
        include: [
          {
            model: PurchaseOrder,
            include: [
              {
                model: Customer,
              },
            ],
          },
        ],
        raw: true,
      });

      if (!seedCompany) {
        return res.sendStatus(422);
      } else {
        const { technologyId: seedDealerMonsantoId } = seedCompany.dataValues;
        const monsantoUserData = await ApiSeedCompany.findOne({
          where: { organizationId: organizationId },
        });
        const productSummaryRequest = await buildProductBookingSummaryRequest({
          seedDealerMonsantoId,
          organizationName: organization.name,
          organizationAddress,
          organizationBusinessCity,
          organizationBusinessState,
          organizationBusinessZip,
          orders: [
            {
              orderNumber: 999999,
              orderType: 'SummaryRequest',
              orderReference: 9999999999,
              directShip: 0,
              productYear: calculateSeedYear(),
              issuedDate: x2,
              products: [],
              shipTo: {
                name: organization.dataValues.name, //TODO discusss if organization.dataValues name should be mandatory
                identifier: seedDealerMonsantoId,
                agency: 'GLN',
                addressInformation: {
                  city: organization.dataValues.businessCity || '',
                  state: organization.dataValues.businessState || 'NE',
                  postalCode: organization.dataValues.businessZip || '10000',
                  postalCountry: 'US', //TODO: ask sourabh
                  address: organization.dataValues.address || '',
                },
              },
            },
          ],
          monsantoUserData,
        });

        const xmlResponse = await request.post(config.monsantoEndPoint, {
          'content-type': 'text/plain',
          body: productSummaryRequest,
        });

        const parsedResponse = await parseXmlStringPromise(xmlResponse);
        const response = await parseProductBookingSummaryResponse(parsedResponse);
        response.properties.forEach((reponseOrder, index) => {
          const findPurchaseOrders = purchaseOrderList.filter(
            (d) => d.purchaseOrderId === Number(reponseOrder.orderNumber),
          );
          if (findPurchaseOrders.length > 0) {
            reponseOrder.detail.map((item) => {
              const data = findPurchaseOrders.filter(
                (p) => p['MonsantoProduct.crossReferenceId'] === item.identification.identifier,
              );
              (data.length > 1
                ? data.filter((d) => parseInt(item.quantity.value) === parseInt(d.monsantoOrderQty))
                : data
              ).map((findPurchaseOrder) => {
                const isExitInResponseIndex = _.findIndex(responseData, {
                  poID: String(reponseOrder.orderNumber),
                });

                if (isExitInResponseIndex === -1) {
                  if (
                    parseInt(findPurchaseOrder.lineItemNumber) === parseInt(item.productBookingLineItemNumber) &&
                    parseInt(findPurchaseOrder.lineNumber) === parseInt(item.lineNumber)
                  ) {
                    if (parseInt(item.quantity.value) !== parseInt(findPurchaseOrder.monsantoOrderQty)) {
                      responseData.push({
                        customerName: findPurchaseOrder['PurchaseOrder.Customer.name'],
                        customerId: findPurchaseOrder['PurchaseOrder.Customer.id'],
                        comment: `{"${item.identification.productName}" : ${item.quantity.value} ${item.quantity.unit} (Bayer) vs ${findPurchaseOrder.monsantoOrderQty} ${findPurchaseOrder.unit} (AD) }`,
                        poID: String(findPurchaseOrder.purchaseOrderId),
                      });
                    }
                  } else {
                    responseData.push({
                      customerName: findPurchaseOrder['PurchaseOrder.Customer.name'],
                      customerId: findPurchaseOrder['PurchaseOrder.Customer.id'],
                      comment: `{ ${item.productBookingLineItemNumber} (LineItemNumber(PBR)) and ${item.lineNumber}(LineNumber) is found in bayer but not in DB(${item.identification.identifier}) }`,
                      poID: String(findPurchaseOrder.purchaseOrderId),
                    });
                  }
                }
              });
            });
          } else {
            let comment = reponseOrder.detail
              .map((item) => {
                return `{"${item.identification.productName}" : ${item.quantity.value} ${item.quantity.unit}}`;
              })
              .join('; ');
            responseData.push({
              customerName: 'Order is exits in bayer but not found In AgriDelaer system',
              customerId: '',
              comment: comment,
              poID: reponseOrder.orderNumber,
            });
          }
        });

        purchaseOrderList.map((pOrder) => {
          const findPurchaseOrder = _.find(response.properties, {
            orderNumber: String(pOrder.purchaseOrderId),
          });

          if (findPurchaseOrder) {
            const data = findPurchaseOrder.detail.filter(
              (d) => d.identification.identifier === pOrder['MonsantoProduct.crossReferenceId'],
            );

            (data.length > 1
              ? data.filter((d) => parseInt(d.quantity.value) === parseInt(pOrder.monsantoOrderQty))
              : data
            ).map((item) => {
              const isExitInResponseIndex = _.findIndex(responseData, {
                poID: String(pOrder.purchaseOrderId),
              });

              if (isExitInResponseIndex === -1) {
                if (
                  parseInt(pOrder.lineItemNumber) === parseInt(item.productBookingLineItemNumber) &&
                  parseInt(pOrder.lineNumber) === parseInt(item.lineNumber)
                ) {
                  if (parseInt(item.quantity.value) !== parseInt(pOrder.monsantoOrderQty)) {
                    responseData.push({
                      customerName: pOrder['PurchaseOrder.Customer.name'],
                      customerId: pOrder['PurchaseOrder.Customer.id'],
                      comment: `{ ${pOrder.lineItemNumber}(LineItemNumber) and ${pOrder.lineNumber}(LineItemNumber) is not found in bayer(${item.identification.identifier})}`,
                      poID: String(pOrder.purchaseOrderId),
                    });
                  }
                }
              }
            });
          } else {
            responseData.push({
              customerName: pOrder['PurchaseOrder.Customer.name'],
              customerId: pOrder['PurchaseOrder.Customer.id'],
              comment: `This order is not found in bayer`,
              poID: String(pOrder.purchaseOrderId),
            });
          }
        });

        res.json({ data: responseData });
      }
    } else {
      console.log('hello all org bayerOrderCheck all');
      const responseData = [];

      const allApiseedcompany = await ApiSeedCompany.findAll();
      await Promise.all(
        await allApiseedcompany.map(async (company, i) => {
          setTimeout(async () => {
            const seedDealerMonsantoId = company.dataValues.technologyId;
            // const seedCompanyId = company.dataValues.id;
            const organizationId = company.dataValues.organizationId;
            console.log(organizationId, 'organizationId');

            const organization = await Organization.findById(organizationId);
            const organizationAddress = organization.dataValues.address;
            const organizationBusinessCity = organization.dataValues.businessCity;
            const organizationBusinessState = organization.dataValues.businessState;
            const organizationBusinessZip = organization.dataValues.businessZip;
            const x = new Date().toISOString().split('Z');
            const x1 = x[0].split('.');
            const x2 = x1[0] + '-05:00';
            const purchaseOrderList = await CustomerMonsantoProduct.all({
              where: {
                organizationId: organizationId,
                isDeleted: false,
                isSent: true,
              },
              include: [
                {
                  model: PurchaseOrder,
                  include: [
                    {
                      model: Customer,
                    },
                  ],
                },
              ],
              raw: true,
            });

            if (!company) {
              console.log('company not found');
              return res.sendStatus(422);
            } else {
              const monsantoUserData = await ApiSeedCompany.findOne({
                where: { organizationId: organizationId },
              });

              const productSummaryRequest = await buildProductBookingSummaryRequest({
                seedDealerMonsantoId,
                organizationName: organization.name,
                organizationAddress,
                organizationBusinessCity,
                organizationBusinessState,
                organizationBusinessZip,
                orders: [
                  {
                    orderNumber: 999999,
                    orderType: 'SummaryRequest',
                    orderReference: 9999999999,
                    directShip: 0,
                    productYear: calculateSeedYear(),
                    issuedDate: x2,
                    products: [],
                    shipTo: {
                      name: organization.dataValues.name, //TODO discusss if organization.dataValues name should be mandatory
                      identifier: seedDealerMonsantoId,
                      agency: 'GLN',
                      addressInformation: {
                        city: organization.dataValues.businessCity || '',
                        state: organization.dataValues.businessState || 'NE',
                        postalCode: organization.dataValues.businessZip || '10000',
                        postalCountry: 'US', //TODO: ask sourabh
                        address: organization.dataValues.address || '',
                      },
                    },
                  },
                ],
                monsantoUserData,
              });

              const xmlResponse = await request.post(config.monsantoEndPoint, {
                'content-type': 'text/plain',
                body: productSummaryRequest,
              });

              const parsedResponse = await parseXmlStringPromise(xmlResponse);
              const response = await parseProductBookingSummaryResponse(parsedResponse);

              response.properties.forEach((reponseOrder, index) => {
                const findPurchaseOrders = purchaseOrderList.filter(
                  (d) => d.purchaseOrderId === Number(reponseOrder.orderNumber),
                );
                if (findPurchaseOrders.length > 0) {
                  reponseOrder.detail.map((item) => {
                    //match crossrefId with monsantoProduct
                    const data = findPurchaseOrders.filter(
                      (p) => p['MonsantoProduct.crossReferenceId'] === item.identification.identifier,
                    );
                    (data.length > 1
                      ? data.filter((d) => parseInt(item.quantity.value) === parseInt(d.monsantoOrderQty))
                      : data
                    ).map((findPurchaseOrder) => {
                      const isExitInResponseIndex = _.findIndex(responseData, {
                        poID: String(reponseOrder.orderNumber),
                      });

                      if (isExitInResponseIndex === -1) {
                        if (
                          parseInt(findPurchaseOrder.lineItemNumber) === parseInt(item.productBookingLineItemNumber) &&
                          parseInt(findPurchaseOrder.lineNumber) === parseInt(item.lineNumber)
                        ) {
                          if (parseInt(item.quantity.value) !== parseInt(findPurchaseOrder.monsantoOrderQty)) {
                            responseData.push({
                              customerName: findPurchaseOrder['PurchaseOrder.Customer.name'],
                              customerId: findPurchaseOrder['PurchaseOrder.Customer.id'],
                              comment: `{"${item.identification.productName}" : ${item.quantity.value} ${item.quantity.unit} (Bayer) vs ${findPurchaseOrder.monsantoOrderQty} ${findPurchaseOrder.unit} (AD) }`,
                              poID: String(findPurchaseOrder.purchaseOrderId),
                            });
                          }
                        } else {
                          responseData.push({
                            customerName: findPurchaseOrder['PurchaseOrder.Customer.name'],
                            customerId: findPurchaseOrder['PurchaseOrder.Customer.id'],
                            comment: `{ ${item.productBookingLineItemNumber} (LineItemNumber(PBR)) and ${item.lineNumber}(LineNumber) is found in bayer but not in DB(${item.identification.identifier}) }`,
                            poID: String(findPurchaseOrder.purchaseOrderId),
                          });
                        }
                      }
                    });
                  });
                } else {
                  let comment = reponseOrder.detail
                    .map((item) => {
                      return `{"${item.identification.productName}" : ${item.quantity.value} ${item.quantity.unit}}`;
                    })
                    .join('; ');
                  responseData.push({
                    customerName: 'Order is exits in bayer but not found In AgriDelaer system',
                    customerId: '',
                    comment: comment,
                    poID: reponseOrder.orderNumber,
                  });
                }
              });

              purchaseOrderList.map((pOrder) => {
                const findPurchaseOrder = _.find(response.properties, {
                  orderNumber: String(pOrder.purchaseOrderId),
                });

                if (findPurchaseOrder) {
                  const data = findPurchaseOrder.detail.filter(
                    (d) => d.identification.identifier === pOrder['MonsantoProduct.crossReferenceId'],
                  );

                  (data.length > 1
                    ? data.filter((d) => parseInt(d.quantity.value) === parseInt(pOrder.monsantoOrderQty))
                    : data
                  ).map((item) => {
                    const isExitInResponseIndex = _.findIndex(responseData, {
                      poID: String(pOrder.purchaseOrderId),
                    });
                    //isExitInResponseIndex -> -1 means responseData haven't the PO that we use in findIndex

                    if (isExitInResponseIndex === -1) {
                      if (
                        parseInt(pOrder.lineItemNumber) === parseInt(item.productBookingLineItemNumber) &&
                        parseInt(pOrder.lineNumber) === parseInt(item.lineNumber)
                      ) {
                        if (parseInt(item.quantity.value) !== parseInt(pOrder.monsantoOrderQty)) {
                          responseData.push({
                            customerName: pOrder['PurchaseOrder.Customer.name'],
                            customerId: pOrder['PurchaseOrder.Customer.id'],
                            comment: `{ ${pOrder.lineItemNumber}(LineItemNumber) and ${pOrder.lineNumber}(LineItemNumber) is not found in bayer(${item.identification.identifier})}`,
                            poID: String(pOrder.purchaseOrderId),
                          });
                        }
                      }
                    }
                  });
                } else {
                  responseData.push({
                    customerName: pOrder['PurchaseOrder.Customer.name'],
                    customerId: pOrder['PurchaseOrder.Customer.id'],
                    comment: `This order is not found in bayer`,
                    poID: String(pOrder.purchaseOrderId),
                  });
                }
              });
            }

            console.log(responseData.length, 'responseData');
            return res.json({ data: responseData });
          }, 500 * i);
        }),
      );
    }
  } catch (error) {
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      // here exception parse for both retail order summary and product bookingsummary is same that is
      //  why the parseReatilOrderSummaryError is written there
      if (parseRetailOrderSummaryError(errorXmL) === 'No data found') {
        res.status(200).json({ data: [] });
      }
    } else {
      console.log(error, 'error');
      console.log(`Error from bayerOrderCheck...${error}..: `);
      res.status(400).json({ data: `Error from bayerOrderCheck...${error}..` });
    }
  }
};

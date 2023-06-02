const request = require('request-promise');
const config = require('config').getConfig();
const _ = require('lodash');
const Sequelize = require('sequelize');
const emailUtility = require('utilities/email');

const {
  ApiSeedCompany,
  MonsantoPriceSheet,
  MonsantoRetailerOrderSummary,
  Organization,
  PurchaseOrder,
  Customer,
  MonsantoProductBookingSummaryProducts,
  MonsantoProduct,
  MonsantoRetailerOrderSummaryProduct,
  MonsantoSummarySyncHistory,
  MonsantoProductLineItem,
  TempPBR,
} = require('models');
const { fetchPriceSheet } = require('controllers/MonsantoPriceSheetController');
const { syncRetailerOrderSummary } = require('controllers/MonsantoRetailOrdersController');
const {
  retailOrder: { buildRetailOrderSummaryRequest, parseRetailOrderSummaryResponse },
  common: { parseXmlStringPromise, parseRetailOrderSummaryError },
  productBookingSummary: { buildProductBookingSummaryRequest, parseProductBookingSummaryResponse },
} = require('utilities/xml');
const moment = require('moment');
const { calculateSeedYear } = require('../utilities/xml/common');

const notZonedCropTypes = ['B'];

// return  isSynced  (boolean)
const checkAndSyncPriceSheets = async ({ zones, seedCompanyId, monsantoId, zoneIdHolder, user }) => {
  const cropZoneArray = [];
  zones.map((zone) => {
    if (Array.isArray(zone.zoneId)) {
      zone.zoneId.map((data) => {
        const obj = {};
        obj.cropType = zone.classification;
        obj.zoneId = data;
        cropZoneArray.push(obj);
      });
    } else {
      const obj = {};
      obj.cropType = zone.classification;
      obj.zoneId = zone.zoneId;
      cropZoneArray.push(obj);
    }
  });
  const checkFetchedZones = cropZoneArray.map((zone) => {
    const where = { cropType: zone.cropType };
    where.buyerMonsantoId = monsantoId;
    if (!notZonedCropTypes.includes(zone.cropType)) {
      where.zoneId = zone.zoneId;
    }
    return MonsantoPriceSheet.findOne({ where });
  });
  const possibleFetchedZones = await Promise.all(checkFetchedZones);
  const fetchedZones = possibleFetchedZones.filter((zone) => zone); // remove not fetched
  const notFetchedZones = cropZoneArray.filter(
    (zone) =>
      !fetchedZones.find((fetchedZone) => {
        return (
          fetchedZone.dataValues.cropType === zone.cropType &&
          (notZonedCropTypes.includes(zone.cropType) // ignore zone of not zoned crops
            ? true
            : fetchedZone.dataValues.zoneId === zone.zoneId)
        );
      }),
  );
  const syncingZones = fetchedZones
    .filter((zone) => zone && zone.dataValues.isSyncing)
    .map(({ dataValues: { cropType, zoneId } }) => ({
      cropType,
      zoneId,
    }));
  if (notFetchedZones.length || syncingZones.length) {
    //will return isSyncing true, but also fetchs remaning/new  zones
    if (notFetchedZones.length) {
      // for (let i = 0; i < notFetchedZones.length; i++) {
      //   try {
      //     const { cropType, zoneId } = notFetchedZones[i];
      //     const priceSheet = await fetchPriceSheet({
      //       zoneId,
      //       seedCompanyId,
      //       seedDealerMonsantoId: monsantoId,
      //       user,
      //       cropType
      //     });
      //     console.log(`PriceSheet for "${cropType}" at ${zoneId} Zone synced`);
      //   } catch (err) {
      //     if (err.message === "Customer is not valid in the zone provided") {
      //       const currentZoneIndex = cropZoneArray.findIndex(zone => {
      //         return (
      //           zone.cropType === cropType &&
      //           !notZonedCropTypes.includes(zone.cropType) &&
      //           zone.zoneId === zoneId
      //         );
      //       });
      //       cropZoneArray[currentZoneIndex].invalid = true;
      //       zoneIdHolder.zoneIds = JSON.stringify(cropZoneArray);
      //       return zoneIdHolder.save();
      //     }
      //     console.log(
      //       `Error syncing pricesheet ${cropType} at ${zoneId}: ${err}`
      //     );
      //   }
      // }
      let zonesToFetchPromises = notFetchedZones.map(({ cropType, zoneId }) => {
        return fetchPriceSheet({
          zoneId,
          seedCompanyId,
          seedDealerMonsantoId: monsantoId,
          user,
          cropType,
        })
          .then((_) => console.log(`PriceSheet for "${cropType}" at ${zoneId} Zone synced`))
          .catch((err) => {
            if (err.message === 'Customer is not valid in the zone provided') {
              const currentZoneIndex = cropZoneArray.findIndex((zone) => {
                return (
                  zone.cropType === cropType && !notZonedCropTypes.includes(zone.cropType) && zone.zoneId === zoneId
                );
              });
            }
            MonsantoPriceSheet.findOne({
              where: {
                buyerMonsantoId: monsantoId,
                cropType,
                zoneId,
              },
            }).then(async (priceSheet) => {
              const lastResponse = moment(JSON.parse(priceSheet.dataValues.startRequestTimestamp))
                .add(20, 'm')
                .toDate();
              await MonsantoPriceSheet.update(
                {
                  endRequestTimestamp: lastResponse,
                },
                {
                  where: {
                    buyerMonsantoId: monsantoId,
                    cropType,
                    zoneId,
                  },
                },
              );
            });

            console.log(`Error syncing pricesheet ${cropType} at ${zoneId}: ${err}`);
          });
      });
      // schedule background fetchs
      await Promise.all(zonesToFetchPromises)
        .then((priceSheetarray) => {
          console.log(`All PriceSheets synced successfully`);
          return false;
        })
        .catch((err) => console.log(`Error syncing some PriceSheets`));
    } else if (syncingZones.length) {
      return true;
    }
  }
  return false;
};

const sanitizeZones = (zones) => {
  return zones
    .filter((zone) => !zone.invalid)
    .map(({ classification, zoneId }) => {
      const zone = { classification, zoneId };
      // replace zone of not zoned crops with wildcard, according to bayer endpoint
      if (notZonedCropTypes.includes(classification)) {
        zone.zoneId = '*';
      }
      return zone;
    });
};

module.exports = {
  async checkInventory(req, res) {
    //TODO: handle case when we want to make a diff update using lastDateRequests
    let isSyncing = false;
    //idea only make that update once per day, play one we update inSYnced, the updatedAt will change
    // and therefore we can compare that dat with today
    const { seedCompanyId } = req.query;
    if (!seedCompanyId) res.sendStatus(503);
    const apiSeedCompany = await ApiSeedCompany.findOne({
      where: { id: seedCompanyId },
    });
    if (!apiSeedCompany) res.sendStatus(503);
    const seedDealerMonsantoId = apiSeedCompany.dataValues.technologyId;
    const zones = sanitizeZones(JSON.parse(apiSeedCompany.dataValues.zoneIds));
    isSyncing = await checkAndSyncPriceSheets({
      zones,
      seedCompanyId,
      monsantoId: seedDealerMonsantoId,
      zoneIdHolder: apiSeedCompany,
      user: req.user,
    });
    if (isSyncing) return res.json({ isSynced: false });
    //now we have all pricesheets owned synced and procced to check retailer order sumary
    let retailerOrderSummary = await MonsantoRetailerOrderSummary.findOne({
      where: { buyerMonsantoId: seedDealerMonsantoId },
    });

    // latest code by (jay)

    try {
      if (!retailerOrderSummary) {
        retailerOrderSummary = await syncRetailerOrderSummary({
          user: req.user,
          seedDealerMonsantoId,
        });
      }
      const isSynced = retailerOrderSummary != {} || !retailerOrderSummary.dataValues.isSynced;
      if (isSynced) {
        console.log(`Retailer Order Summary synced`);
      }
      return res.json({ isSynced });
    } catch (error) {
      if (error.response) {
        const errorXmL = await parseXmlStringPromise(error.response.body);
        if (parseRetailOrderSummaryError(errorXmL) === 'No data found') {
          return res.json({ message: `No data found from bayer for your account`, isSynced: false });
        }
      } else {
        console.log(`Error syncing retailer order summary: ${error}`);
        return res.json({ isSynced: false });
      }
    }
  },
  sanitizeZones,
  checkAndSyncPriceSheets,
};

module.exports.syncProductBookingSummary = async (req, res) => {
  const organizationId = req.user.organizationId || req.organizationId;

  try {
    const { seedCompanyId } = req.query || req;
    console.log('syncProductBookingSummary', seedCompanyId);
    const data = await addProductBookingSummaryData({
      seedCompanyId,
      organizationId: organizationId,
      user: req.user,
    });
    return res !== undefined && res.json({ status: true, response: data, update: true });
  } catch (error) {
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      if (parseRetailOrderSummaryError(errorXmL) === 'No data found') {
        console.log(`errr while product summary request: No data found`);
        return res.status(200).json({ status: true, response: [], update: false });
      } else {
        emailUtility.sendEmail(
          'support@agridealer.app',
          'syncInventory cron job fail for productSummaryRequest',
          `SyncInventory fail for organizationId-${organizationId} and error was ${error}`,
          null,
          null,
        );
      }
    } else {
      console.log(`errr while product summary request: ${error}`);
      console.log(error, 'error');
      emailUtility.sendEmail(
        'support@agridealer.app',
        'syncInventory cron job fail for  productSummaryRequest ',
        `SyncInventory fail for organizationId-${organizationId} and error was ${error}`,
        null,
        null,
      );
      return res.status(503).json({ error: error });
    }
  }
};

const addProductBookingSummaryData = async ({ seedCompanyId, organizationId, user }) => {
  try {
    const seedCompany = await ApiSeedCompany.findOne({
      attributes: ['technologyId', 'zoneIds'],
      where: {
        id: seedCompanyId,
      },
    });
    const organization = await Organization.findById(organizationId);
    const organizationAddress = organization.dataValues.address;
    const organizationBusinessCity = organization.dataValues.businessCity;
    const organizationBusinessState = organization.dataValues.businessState;
    const organizationBusinessZip = organization.dataValues.businessZip;
    let x = new Date().toISOString().split('Z');
    let x1 = x[0].split('.');
    let x2 = x1[0] + '-05:00';
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

    const dealerAccount = await Customer.findOne({
      attributes: ['id'],
      where: {
        organizationId: organizationId,
        name: 'Bayer Dealer Bucket',
        isArchive: false,
      },
    });
    const customerAsDealerId = dealerAccount.id;
    let allPurchaseOrder = await PurchaseOrder.findAll({
      where: {
        organizationId: organizationId,
        isDeleted: false,
      },
    });

    //get latest syncId for history
    let currentSyncId;
    const historyData = await MonsantoSummarySyncHistory.findAll({
      where: {
        organizationId: organizationId,
      },
      order: [[Sequelize.cast(Sequelize.col('syncId'), 'INTEGER'), 'DESC']],
      limit: 1,
    });
    if (!historyData || !historyData.length) {
      currentSyncId = 1;
    } else {
      currentSyncId = parseInt(historyData[0].syncId) + 1;
    }

    // let allPurchaseOrdres = await PurchaseOrder.findAll({ attributes: ['id'] });

    const dealerOrderIdList = [];
    const growerOrderList = [];
    let delaerBuketPurchaesOrderID = '';
    allPurchaseOrder.map((item) => {
      if (item.dataValues.customerId === customerAsDealerId) {
        dealerOrderIdList.push(JSON.stringify(item.dataValues.id));
        delaerBuketPurchaesOrderID = String(item.dataValues.id);
      } else {
        growerOrderList.push(JSON.stringify(item.dataValues.id));
      }
    });

    const responseDealerOrderProducts = []; // for dealerOrderI
    const filtedResponse = []; // for growerOrder

    await createTempproductBookingRequestData(response, organizationId);

    response.properties.map((prodResp) => {
      if (dealerOrderIdList.includes(prodResp.orderNumber)) {
        prodResp.detail.map((item) => responseDealerOrderProducts.push(item));
      } else if (growerOrderList.includes(prodResp.orderNumber)) {
        prodResp.detail.map((item) => filtedResponse.push(item));
      } else {
        if (prodResp.partnerName === 'MY DEALER BUCKET') {
          prodResp.detail.map((item) => responseDealerOrderProducts.push(item));
        } else {
          prodResp.detail.map((item) => filtedResponse.push(item));
        }
      }
    });

    // filtedResponse contains all the growers details
    // responseDealerOrderProducts contains all the dealer orders details buket

    // dealer product grouping
    let dealerProductGroup = _.groupBy(responseDealerOrderProducts, 'identification.identifier');
    // adding all the dealerOrders products
    await Promise.all(
      Object.keys(dealerProductGroup).map(async (productId) => {
        const monsanto_product_data = await MonsantoProduct.findOne({
          where: {
            crossReferenceId: productId,
            organizationId: organizationId,
          },
        });

        if (monsanto_product_data) {
          let dealerBucketQuantity = 0;
          dealerProductGroup[productId].map((item) => {
            dealerBucketQuantity += parseFloat(item.quantity.value, 10);
          });
          const monsantoProductBookingsummaryProduct = await MonsantoProductBookingSummaryProducts.findOne({
            where: {
              // productId: monsanto_product_data.dataValues.id,
              organizationId: organizationId,
              crossReferenceId: productId,
            },
          });
          if (monsantoProductBookingsummaryProduct) {
            let query1 = { bayerDealerBucketQty: parseFloat(dealerBucketQuantity, 10) };
            if (
              parseFloat(monsantoProductBookingsummaryProduct.bayerDealerBucketQty, 10) !==
              parseFloat(dealerBucketQuantity, 10)
            ) {
              query1 = { ...query1, isChanged: true };
              await MonsantoSummarySyncHistory.create({
                productId: monsanto_product_data.dataValues.id,
                bayerDealerBucketQtyBefore: parseFloat(monsantoProductBookingsummaryProduct.bayerDealerBucketQty, 10),
                bayerDealerBucketQty: parseFloat(dealerBucketQuantity, 10),
                allGrowerQtyBefore: 0,
                allGrowerQty: 0,
                syncId: currentSyncId,
                organizationId,
              });
            }
            // update product
            await monsantoProductBookingsummaryProduct.update(query1);
          } else {
            // create product
            console.log(`creating new product for bayer dealer order in table with id ${productId}`);
            await MonsantoProductBookingSummaryProducts.create({
              productId: monsanto_product_data.dataValues.id,
              bayerDealerBucketQty: parseFloat(dealerBucketQuantity, 10),
              allGrowerQty: 0,
              organizationId,
              isChanged: true,
              crossReferenceId: productId,
            });
            await MonsantoSummarySyncHistory.create({
              productId: monsanto_product_data.dataValues.id,
              bayerDealerBucketQtyBefore: 0,
              bayerDealerBucketQty: parseFloat(dealerBucketQuantity, 10),
              allGrowerQtyBefore: 0,
              allGrowerQty: 0,
              syncId: currentSyncId,
              organizationId,
            });
          }
        } else {
          console.log(`product not found in AD database ${productId}`);
        }
      }),
    );
    // grower product grouping
    let growerProductGroup = _.groupBy(filtedResponse, 'identification.identifier');

    await Promise.all(
      Object.keys(growerProductGroup).map(async (productId) => {
        const monsanto_product_data = await MonsantoProduct.findOne({
          where: {
            crossReferenceId: productId,
            organizationId: organizationId,
          },
        });
        if (monsanto_product_data) {
          let growerProductTotal = 0;
          growerProductGroup[productId].map((item) => {
            growerProductTotal += parseFloat(item.quantity.value, 10);
          });
          const monsantoProductBookingsummaryProduct = await MonsantoProductBookingSummaryProducts.findOne({
            where: {
              crossReferenceId: monsanto_product_data.dataValues.crossReferenceId,
              organizationId: organizationId,
            },
          });
          const checkSummaryHistory = await MonsantoSummarySyncHistory.findOne({
            where: {
              productId: monsanto_product_data.dataValues.id,
              organizationId: organizationId,
              syncId: currentSyncId,
            },
          });
          if (monsantoProductBookingsummaryProduct) {
            let query = { allGrowerQty: parseFloat(growerProductTotal, 10) };
            if (parseFloat(monsantoProductBookingsummaryProduct.allGrowerQty) !== parseFloat(growerProductTotal, 10)) {
              query = { ...query, isChanged: true };
              if (checkSummaryHistory) {
                await checkSummaryHistory.update({
                  allGrowerQtyBefore: monsantoProductBookingsummaryProduct.allGrowerQty,
                  allGrowerQty: parseFloat(growerProductTotal, 10),
                });
              } else {
                await MonsantoSummarySyncHistory.create({
                  productId: monsanto_product_data.dataValues.id,
                  bayerDealerBucketQtyBefore: 0,
                  bayerDealerBucketQty: 0,
                  allGrowerQtyBefore: monsantoProductBookingsummaryProduct.allGrowerQty,
                  allGrowerQty: parseFloat(growerProductTotal, 10),
                  syncId: currentSyncId,
                  organizationId,
                });
              }
            }
            // update product
            await monsantoProductBookingsummaryProduct.update(query);
          } else {
            // create product
            console.log(`creating new product for bayer dealer order in table with id ${productId}`);
            await MonsantoProductBookingSummaryProducts.create({
              productId: monsanto_product_data.dataValues.id,
              bayerDealerBucketQty: 0,
              allGrowerQty: parseFloat(growerProductTotal, 10),
              organizationId,
              isChanged: true,
              crossReferenceId: productId,
            });
          }
        } else {
          console.log(`product not found in AD database ${productId}`);
        }
      }),
    );

    // If products exist in AD DB table BUT NOT in PBS response, we need to update their quantities to 0
    const allProductBookingsummaryProduct = await MonsantoProductBookingSummaryProducts.all({
      where: {
        organizationId: user.organizationId,
      },

      raw: true,
    });

    await Promise.all(
      allProductBookingsummaryProduct.map(async (product) => {
        let isFoundForGrower = false;
        let isFoundForDealer = false;
        // response.properties.map(async (prodResp) => {
        //   const filtedResponse = prodResp.detail.map((item) => item);
        //   const newgrouped = _.groupBy(filtedResponse, 'identification.identifier');
        // const isDelaerBucketOrder = prodResp.orderNumber === delaerBuketPurchaesOrderID;

        if (Object.keys(growerProductGroup).includes(product.crossReferenceId)) {
          isFoundForGrower = true;
        }

        if (Object.keys(dealerProductGroup).includes(product.crossReferenceId)) {
          isFoundForDealer = true;
        }

        // });

        if (!isFoundForGrower) {
          await MonsantoProductBookingSummaryProducts.update(
            {
              allGrowerQty: 0,
            },
            { where: { productId: product.productId, organizationId: organizationId } },
          );
        }

        if (!isFoundForDealer) {
          await MonsantoProductBookingSummaryProducts.update(
            {
              bayerDealerBucketQty: 0,
            },
            { where: { productId: product.productId, organizationId: organizationId } },
          );
        }
      }),
    );

    await updateRetailerOrder({ monsantoUserData, seedDealerMonsantoId, user });

    return [];
  } catch (error) {
    throw error;
  }
};

async function updateRetailerOrder({ user, seedDealerMonsantoId, monsantoUserData }) {
  const retailOrderSummaryRequest = await buildRetailOrderSummaryRequest({
    user: user,
    seedDealerMonsantoId,
    monsantoUserData,
  });
  const retailXmlResponse = await request.post(config.monsantoEndPoint, {
    'content-type': 'text/plain',
    body: retailOrderSummaryRequest,
  });
  const retailParsedResponse = await parseXmlStringPromise(retailXmlResponse);
  const retailResponse = await parseRetailOrderSummaryResponse(retailParsedResponse);
  let emaildata = [];
  Promise.all(
    retailResponse.OrderDetails.map(async (order) => {
      const monsanto_product_data = await MonsantoProduct.findOne({
        where: {
          crossReferenceId: order.productIdentification,
          organizationId: user.organizationId,
        },
      });
      if (monsanto_product_data !== null) {
        await MonsantoRetailerOrderSummaryProduct.update(
          {
            supply: parseInt(order.totalRetailerProductQuantity.measurementValue),
          },
          { where: { productId: monsanto_product_data.dataValues.id } },
        );
      } else {
        emaildata.push(order.productIdentification);
      }
    }),
  ).then(() => {
    emaildata.length > 0 &&
      emailUtility.sendEmail(
        'support@agridealer.app',
        'Product Not Found Email',
        `Below Product is not found in RetailOrderSummaryRequest`,
        `<p>Below Product is not found in RetailOrderSummaryRequest</p><br></br>${emaildata.map((data) => {
          return `<p>
              The product name/detail No Found , the Bayer product ID ${data} and the organizationId is
              ${user.organizationId}
            </p>`;
        })}`,
        null,
      );
  });
}

async function createTempproductBookingRequestData(response, organizationId) {
  response.properties.map((prodResp) => {
    prodResp.detail.map(async (item) => {
      const isExits = await TempPBR.findOne({
        where: {
          organizationId: organizationId,
          purchaseOrderId: prodResp.orderNumber,
          salesOrderReferenceNumber: prodResp.crossRefIdentifier,
          lineNumber: item.lineNumber,
          lineItemNumber: item.productBookingLineItemNumber,
          crossReferenceId: item.identification.identifier,
          productDetail: item.identification.productName,
          quanity: item.quantity.value,
        },
      });
      if (!isExits) {
        await TempPBR.create({
          organizationId: organizationId,
          purchaseOrderId: prodResp.orderNumber,
          salesOrderReferenceNumber: prodResp.crossRefIdentifier,
          lineNumber: item.lineNumber,
          lineItemNumber: item.productBookingLineItemNumber,
          crossReferenceId: item.identification.identifier,
          productDetail: item.identification.productName,
          quanity: item.quantity.value,
        })
          .then((res) => {
            // console.log('res');
          })
          .catch((err) => {
            // console.log(err, 'err');
          });
      } else {
        // console.log('Alredy exit this Data in tempPBRS');
      }
    });
  });
}

module.exports.fetchQtyProductBookingSummary = async (req, res) => {
  const { seedCompanyId, fetchQty, productId, gropedProductData } = req.query;

  const isSeedSizeSwap = req.query.DealerOrderSwap && req.query.DealerOrderSwap == 'true' ? true : false;
  console.log(isSeedSizeSwap, 'isSeedSizeSwap');
  const organization = await Organization.findById(req.user.organizationId);
  const organizationAddress = organization.dataValues.address;
  const organizationBusinessCity = organization.dataValues.businessCity;
  const organizationBusinessState = organization.dataValues.businessState;
  const organizationBusinessZip = organization.dataValues.businessZip;
  let x = new Date().toISOString().split('Z');
  let x1 = x[0].split('.');
  let x2 = x1[0] + '-05:00';
  const seedCompany = await ApiSeedCompany.findOne({
    attributes: ['technologyId', 'zoneIds'],
    where: {
      id: seedCompanyId,
    },
  });
  const { technologyId: seedDealerMonsantoId } = seedCompany.dataValues;
  const monsantoUserData = await ApiSeedCompany.findOne({
    where: { organizationId: req.user.organizationId },
  });

  const order = await MonsantoProduct.findAll({
    where: { crossReferenceId: productId, organizationId: req.user.organizationId },
    include: [
      {
        model: MonsantoProductLineItem,
        as: 'LineItem',
      },
    ],
  });
  const product = [];
  const makeUnique =
    order.length > 0 &&
    order.reduce((list, item) => {
      const hasItem = list.find((listItem) => ['crossReferenceId'].every((key) => listItem[key] === item[key]));
      if (!hasItem) list.push(item);
      return list;
    }, []);

  await makeUnique.map((order) => {
    const unitcode = order.dataValues.LineItem
      ? order.dataValues.LineItem.dataValues.suggestedDealerMeasurementUnitCode
      : 0;
    const find = JSON.parse(gropedProductData).find((d) => d.crossReferenceId == order.dataValues.crossReferenceId);

    order.dataValues.LineItem &&
      product.push({
        lineNumber: order.dataValues.LineItem.dataValues.lineNumber || '999999',
        lineItemNumber: order.dataValues.LineItem.dataValues.lineItemNumber || 1,
        action: 'Add',
        requestedDate: x2,
        crossReferenceProductId: order.dataValues.crossReferenceId,
        increaseOrDecrease: {
          type: isSeedSizeSwap
            ? find.increase == true
              ? 'Increase'
              : 'Decrease'
            : find.removeSupply
            ? 'Decrease'
            : 'Increase',
          unit: JSON.parse(unitcode).value,
          value: find.dealerQty,
        },
        quantity: {
          value: isSeedSizeSwap
            ? find.supply || 0
            : find.removeSupply
            ? 0
            : parseFloat(find.supply) + parseFloat(find.dealerQty || 0),
          unit: JSON.parse(unitcode).value,
        },
        actionRequest: find.actionRequest,
        orderQty: 0,
        monsantoOrderQty: 0,
        requestedShipDate: x2, // ASK sourabh
        isDeleted: false,
        lineItem: order.dataValues.LineItem.dataValues,
      });
  });

  console.log(product.length, 'product');
  const productSummaryRequest = await buildProductBookingSummaryRequest({
    seedDealerMonsantoId,
    organizationName: organization.name,
    organizationAddress,
    organizationBusinessCity,
    organizationBusinessState,
    organizationBusinessZip,
    isDealerUpdate: true,
    orders: [
      {
        orderNumber: 9999,
        orderType: isSeedSizeSwap ? 'DealerOrderSwap' : 'DealerOrderUpdate',
        orderReference: 9999999999,
        directShip: 0,
        productYear: calculateSeedYear(),
        issuedDate: x2,
        products: product,
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
  console.log(response.properties[0], 'response');
  return res.status(200).json({ data: response.properties[0].responseStatus, detail: response.properties[0].detail });
};

// create statement automaticlly
const moment = require('moment');
const config = require('config').getConfig();
const request = require('request-promise');
const {
  common: { parseXmlStringPromise },
  products: { parsePriceSheetResponse, buildPriceSheetRequest },
} = require('utilities/xml');
const { groupBy } = require('lodash');
const CronJob = require('cron').CronJob;
const { monsantoTechnologyId: MONSANTO_TECH_ID } = config;
const { Op } = require('sequelize');

const {
  Organization,
  ApiSeedCompany,
  MonsantoProduct,
  MonsantoProductLineItem,
  MonsantoPriceSheet,
  sequelize,
  User,
} = require('models');
const { fetchPriceSheet } = require('controllers/MonsantoPriceSheetController');

const job = new CronJob(
  // '* * * * *',
  //everyday
  // '00 00 * * *',
  // "*/5 * * * *",
  '0 1 * * *', // run at 1AM every night

  async () => {
    try {
      //await updatePricesheet();
    } catch (err) {
      if (err.message == 'No data found') {
        console.log('No need to request pricesheet because everything is already synced!');
      }
      console.log('update latest pricesheet job done');
    }
  },
  null,
  true,
  'America/Chicago',
);

// const job2 = new CronJob(
//   // '* * * * *',
//   //everyday
//   // '0 0 * * 0',
//   // "*/5 * * * *",

//   '0 1 * * *', // run at 1AM every night
//   async () => {
//     try {
//       //await updatePricesheet2();
//     } catch (err) {
//       console.log('>>>>>>>>>>>>>>>>>>>>>>>.', err);
//       if (err.message == 'No data found') {
//         console.log('No need to request pricesheet because everything is already synced!');
//       }
//       console.log('update latest pricesheet job done');
//     }
//   },
//   null,
//   true,
//   'America/Chicago',
// );

async function updatePricesheet() {
  console.log('--------Start update latest pricesheet latest job------');
  const transaction = await sequelize.transaction();
  try {
    const allApiseedcompany = await ApiSeedCompany.findAll();
    let data = [];
    let uniqueZoneArray = [];
    let seedDealerMonsantoId;
    let seedCompanyId;
    let organizationId;
    let companyData;
    await Promise.all(
      allApiseedcompany.map(async (company) => {
        companyData = company;
        seedDealerMonsantoId = company.dataValues.technologyId;
        seedCompanyId = company.dataValues.id;
        cropZoneArray = JSON.parse(company.dataValues.zoneIds);
        organizationId = company.dataValues.organizationId;

        data = [...data, ...cropZoneArray];
      }),
    );

    data.forEach((c) => {
      if (Array.isArray(c.zoneId)) {
        c.zoneId.map((z) => {
          uniqueZoneArray.push({ classification: c.classification, zoneId: z });
        });
      } else {
        uniqueZoneArray.push(c);
      }
    });

    const uniqueZone = unique(uniqueZoneArray, ['classification', 'zoneId']);

    await Promise.all(
      uniqueZone.map(async (cropZoneObj, i) => {
        setTimeout(async () => {
          const cropType = cropZoneObj.classification;
          const zoneId = cropZoneObj.zoneId;

          await fetchLatestPricesheet(
            companyData,
            cropType,
            zoneId,
            seedDealerMonsantoId,
            seedCompanyId,
            organizationId,
          );
        }, 40000 * i);
      }),
    );
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
  console.log('update latest pricesheet job done');
}
updatePricesheet();
async function fetchLatestPricesheet(
  apiCompany,
  cropType,
  zoneId,
  seedDealerMonsantoId,
  seedCompanyId,
  organizationId,
) {
  console.log(cropType, 'cropType-------------------------', zoneId, 'priceSheet---------- ');
  const currentUser = await User.findOne({
    where: {
      organizationId: apiCompany.dataValues.organizationId,
    },
  });
  let priceSheet = await MonsantoPriceSheet.findOne({
    where: {
      buyerMonsantoId: seedDealerMonsantoId,
      cropType,
      zoneId,
    },
  });
  if (!priceSheet) return;
  priceSheet = priceSheet.dataValues;

  // this will be helpful when we want to make lastRequest dynamic
  // const lastRequest = JSON.parse(priceSheet.lastUpdateDate);
  let lastRequest = process.env.PRICESHEETDEFAULTDATE;
  let previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - 1);

  const monsantoUserData = { dataValues: apiCompany.dataValues };
  const priceSheetRequest = await buildPriceSheetRequest({
    user: currentUser,
    cropType,
    zoneId,
    seedDealerMonsantoId,
    lastRequest:
      lastRequest || moment(previousDate).format('YYYY-MM-DD') + 'T00:00:00.000Z' || process.env.PRICESHEETDEFAULTDATE,
    monsantoUserData,
  });
  const xmlResponseString = await request.post(config.monsantoEndPoint, {
    'content-type': 'text/plain',
    body: priceSheetRequest,
  });
  const parsedString = await parseXmlStringPromise(xmlResponseString);
  const priceSheetData = await parsePriceSheetResponse(parsedString, cropType);
  let { productLineItems } = priceSheetData;
  const productIDs = new Set();
  const products = [];
  const productCrossRefIds = [];
  productLineItems.forEach((lineItem) => {
    if (!productIDs.has(lineItem.product.AgiisId)) {
      productIDs.add(lineItem.product.AgiisId);
      products.push(lineItem.product);
      productCrossRefIds.push(lineItem.product.AgiisId);
    }
  });
  // this code here to test removed products from bayer api

  productLineItems = productLineItems.filter((item) => {
    if (item.product.AgiisId == '00883580264334') {
      return false;
    } else {
      return true;
    }
  });
  const productMap = {};
  const transaction = await sequelize.transaction();

  const allApiseedcompany = await ApiSeedCompany.findAll();

  await Promise.all(
    allApiseedcompany.map(async (company, i) => {
      setTimeout(async () => {
        companyData = company;
        seedDealerMonsantoId = company.dataValues.technologyId;
        seedCompanyId = company.dataValues.id;
        cropZoneArray = JSON.parse(company.dataValues.zoneIds);
        organizationId = company.dataValues.organizationId;
        const separatetheZones = [];
        cropZoneArray.forEach((c) => {
          if (Array.isArray(c.zoneId)) {
            c.zoneId.map((z) => {
              separatetheZones.push({ classification: c.classification, zoneId: z });
            });
          } else {
            separatetheZones.push(c);
          }
        });
        const isAvailbleZone = separatetheZones.filter((s) => s.classification == cropType && s.zoneId == zoneId);
        console.log(isAvailbleZone, 'isAvailbleZone', organizationId);

        if (isAvailbleZone.length > 0) {
          const removedProducts = await checkMonsantoRemovedProducts(
            productCrossRefIds,
            cropType,
            company.dataValues.organizationId,
          );

          try {
            await Promise.all(
              removedProducts.map((item) => {
                return MonsantoProduct.update(
                  {
                    isDeletedInBayer: true,
                  },
                  {
                    where: {
                      crossReferenceId: item.crossReferenceId,
                      organizationId: company.dataValues.organizationId,
                      isDeletedInBayer: false,
                      zoneId: {
                        [Op.contains]: [`${item.zoneId.toString()}`],
                      },
                    },
                  },
                );
              }),
            );

            const updateProduct = async (product) => {
              let monsantoProduct = await MonsantoProduct.findOne({
                where: {
                  crossReferenceId: product.AgiisId,
                  organizationId: company.dataValues.organizationId,
                  zoneId: {
                    [Op.contains]: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
                  },
                },
              });

              if (monsantoProduct) {
                productMap[product.AgiisId] = monsantoProduct.id;
                return MonsantoProduct.update(
                  {
                    ...product,
                    crossReferenceId: product.AgiisId,
                    seedCompanyId: seedCompanyId,
                    organizationId: organizationId,
                    cropType,
                    zoneId: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
                  },
                  {
                    where: {
                      crossReferenceId: product.AgiisId,
                      organizationId: organizationId,
                      zoneId: {
                        [Op.contains]: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
                      },
                    },
                  },
                );
              } else {
                console.log('create');
                return MonsantoProduct.create({
                  ...product,
                  crossReferenceId: product.AgiisId,
                  seedCompanyId: seedCompanyId,
                  organizationId: organizationId,
                  cropType,
                  isDeletedInBayer: false,
                  zoneId: [product.zoneId.toString() == '*' ? 'NZI' : product.zoneId.toString()],
                }).then(({ dataValues: product }) => {
                  productMap[product.crossReferenceId] = product.id;
                });
              }
            };

            const createOrUpdateLineItem = async (productLineItem) => {
              const {
                lineNumber,
                crossReferenceProductId,
                effectiveFrom,
                effectiveTo,
                zoneId,
                suggestedDealerPrice,
                suggestedDealerCurrencyCode,
                suggestedDealerMeasurementValue,
                suggestedDealerMeasurementUnitCode,
                suggestedEndUserPrice,
                suggestedEndUserCurrencyCode,
                suggestedEndUserMeasurementValue,
                suggestedEndUserMeasurementUnitCode,
              } = productLineItem;
              const product = await MonsantoProductLineItem.findOne({
                where: {
                  productId: productMap[crossReferenceProductId],
                  zoneId: {
                    [Op.contains]: [zoneId.toString() == '*' ? 'NZI' : zoneId.toString()],
                  },
                  organizationId: organizationId,
                },
              });
              if (!product) {
                const suggestedDealerPriceJson = {};
                const suggestedEndUserPriceJson = {};

                const newZoneId = [];
                if (!zoneId.toString()) {
                  newZoneId.push('NZI');
                } else {
                  if (zoneId.toString !== '') {
                    newZoneId.push(zoneId.toString());
                  }
                }
                if (!zoneId.toString()) {
                  suggestedDealerPriceJson[`NZI`] = suggestedDealerPrice;
                  suggestedEndUserPriceJson[`NZI`] = suggestedEndUserPrice;
                } else {
                  suggestedDealerPriceJson[`${zoneId}`] = suggestedDealerPrice;
                  suggestedEndUserPriceJson[`${zoneId}`] = suggestedEndUserPrice;
                }
                await MonsantoProductLineItem.create({
                  organizationId: organizationId,
                  zoneId: [...newZoneId],
                  lineNumber,
                  crossReferenceProductId,
                  effectiveFrom,
                  effectiveTo,
                  suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
                  suggestedDealerCurrencyCode: JSON.stringify(suggestedDealerCurrencyCode),
                  suggestedDealerMeasurementValue,
                  suggestedDealerMeasurementUnitCode: JSON.stringify(suggestedDealerMeasurementUnitCode),
                  suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
                  suggestedEndUserCurrencyCode: JSON.stringify(suggestedEndUserCurrencyCode),
                  suggestedEndUserMeasurementValue,
                  suggestedEndUserMeasurementUnitCode: JSON.stringify(suggestedEndUserMeasurementUnitCode),
                  productId: productMap[crossReferenceProductId],
                  cropType: cropType,
                });
              } else {
                const suggestedDealerPriceJson = {
                  ...JSON.parse(product.suggestedDealerPrice),
                };
                const suggestedEndUserPriceJson = {
                  ...JSON.parse(product.suggestedEndUserPrice),
                };
                if (!zoneId.toString()) {
                  suggestedDealerPriceJson[`NZI`] = suggestedDealerPrice;
                  suggestedEndUserPriceJson[`NZI`] = suggestedEndUserPrice;
                  if (
                    suggestedDealerPriceJson[`NZI`] !== suggestedDealerPrice &&
                    suggestedEndUserPriceJson[`NZI`] !== suggestedEndUserPrice
                  ) {
                    await MonsantoProductLineItem.update(
                      {
                        suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
                        suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
                      },
                      {
                        where: {
                          crossReferenceProductId,
                          productId: productMap[crossReferenceProductId],
                          organizationId: organizationId,
                          zoneId: {
                            [Op.contains]: ['NZI'],
                          },
                        },
                      },
                    );
                  }
                } else {
                  suggestedDealerPriceJson[`${zoneId}`] = suggestedDealerPrice;
                  suggestedEndUserPriceJson[`${zoneId}`] = suggestedEndUserPrice;
                  if (
                    suggestedDealerPriceJson[`${zoneId}`] !== suggestedDealerPrice &&
                    suggestedEndUserPriceJson[`${zoneId}`] !== suggestedEndUserPrice
                  ) {
                    await MonsantoProductLineItem.update(
                      {
                        suggestedDealerPrice: JSON.stringify(suggestedDealerPriceJson),
                        suggestedEndUserPrice: JSON.stringify(suggestedEndUserPriceJson),
                      },
                      {
                        where: {
                          crossReferenceProductId,
                          productId: productMap[crossReferenceProductId],
                          organizationId: organizationId,
                          zoneId: {
                            [Op.contains]: [`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`],
                          },
                        },
                      },
                    );
                  }
                }

                // let newZoneId = [...product.zoneId];
                // if (!zoneId.toString() && !product.zoneId.includes('NZI')) {
                //   newZoneId.push('NZI');
                // } else {
                //   if (!product.zoneId.includes(zoneId.toString())) {
                //     newZoneId.push(zoneId.toString());
                //   }
                // }
              }
            };

            await Promise.all(products.map(updateProduct));
            await Promise.all(productLineItems.map(createOrUpdateLineItem));

            await MonsantoPriceSheet.update(
              {
                isSyncing: false,
                endRequestTimestamp: JSON.stringify(new Date().toISOString()),
                lastUpdateDate:
                  productLineItems.length > 0 ? JSON.stringify(new Date().toISOString()) : priceSheet.lastRequest,
              },
              {
                where: {
                  buyerMonsantoId: seedDealerMonsantoId,
                  cropType,
                  zoneId,
                },
                transaction,
              },
            );
          } catch (err) {
            console.log(err);

            throw err;
          }
        }
      }, 5000 * i);
    }),
  );
}

async function checkMonsantoRemovedProducts(productCrossRefIds, cropType, organizationId) {
  const AllMonsantoProducts = await MonsantoProduct.findAll({
    where: {
      classification: cropType,
      isDeletedInBayer: false,

      organizationId: organizationId,
    },
  });
  const removedProduct = [];
  AllMonsantoProducts.map((product) => {
    if (!productCrossRefIds.includes(product.dataValues.crossReferenceId)) {
      removedProduct.push({ crossReferenceId: product.dataValues.crossReferenceId, zoneId: product.dataValues.zoneId });
    }
  });
  return removedProduct;
}
//find unique object from array of object
function unique(arr, keyProps) {
  const kvArray = arr.map((entry) => {
    const key = keyProps.map((k) => entry[k]).join('|');
    return [key, entry];
  });
  const map = new Map(kvArray);
  return Array.from(map.values());
}

// async function updatePricesheet2() {
//   console.log('Start update latest pricesheet latest job');
//   const transaction = await sequelize.transaction();
//   try {
//     const allApiseedcompany = await ApiSeedCompany.findOne();
//     const seedDealerMonsantoId = allApiseedcompany.dataValues.technologyId;
//     const seedCompanyId = allApiseedcompany.dataValues.id;
//     const cropZoneArray = JSON.parse(allApiseedcompany.dataValues.zoneIds);
//     const organizationId = allApiseedcompany.dataValues.organizationId;

//     cropZoneArray.map(async (cropZoneObj) => {
//       const cropType = cropZoneObj.classification;
//       const zoneId = cropZoneObj.zoneId;

//       if (Array.isArray(cropZoneObj.zoneId)) {
//         await Promise.all(
//           cropZoneObj.zoneId.map(async (zoneId) => {
//             await fetchLatestPricesheet2(
//               allApiseedcompany,
//               cropType,
//               zoneId,
//               seedDealerMonsantoId,
//               seedCompanyId,
//               organizationId,
//             );
//           }),
//         );
//       } else {
//         await fetchLatestPricesheet2(
//           allApiseedcompany,
//           cropType,
//           zoneId,
//           seedDealerMonsantoId,
//           seedCompanyId,
//           organizationId,
//         );
//       }
//     });
//   } catch (err) {
//     await transaction.rollback();
//     throw err;
//   }
//   console.log('update latest pricesheet job done');
// }

// async function fetchLatestPricesheet2(company, cropType, zoneId, seedDealerMonsantoId, seedCompanyId, organizationId) {
//   const currentUser = await User.findOne({
//     where: {
//       organizationId: company.dataValues.organizationId,
//     },
//   });
//   let priceSheet = await MonsantoPriceSheet.findOne({
//     where: {
//       buyerMonsantoId: seedDealerMonsantoId,
//       cropType,
//       zoneId,
//     },
//   });
//   if (!priceSheet) return;
//   priceSheet = priceSheet.dataValues;

//   // this will be helpful when we want to make lastRequest dynamic
//   // const lastRequest = JSON.parse(priceSheet.lastUpdateDate);
//   let lastRequest = process.env.PRICESHEETDEFAULTDATE;
//   // const lastRequest = '2021-08-30T09:18:33.027Z';
//   const monsantoUserData = { dataValues: company.dataValues };
//   const priceSheetRequest = await buildPriceSheetRequest({
//     user: currentUser,
//     cropType,
//     zoneId,
//     seedDealerMonsantoId,
//     lastRequest,
//     monsantoUserData,
//   });
//   const xmlResponseString = await request.post(config.monsantoEndPoint, {
//     'content-type': 'text/plain',
//     body: priceSheetRequest,
//   });
//   const parsedString = await parseXmlStringPromise(xmlResponseString);
//   const priceSheetData = await parsePriceSheetResponse(parsedString, cropType);
//   let { productLineItems } = priceSheetData;
//   const productIDs = new Set();
//   const products = [];
//   const productCrossRefIds = [];
//   productLineItems.forEach((lineItem) => {
//     if (!productIDs.has(lineItem.product.AgiisId)) {
//       productIDs.add(lineItem.product.AgiisId);
//       products.push(lineItem.product);
//       productCrossRefIds.push(lineItem.product.AgiisId);
//     }
//   });

//   // this code here to test removed products from bayer api

//   // productLineItems = productLineItems.filter(item => {
//   //   if (item.product.AgiisId == '00883580264334') {
//   //     return false;
//   //   } else {
//   //     return true;
//   //   }
//   // });
//   const productMap = {};
//   const transaction = await sequelize.transaction();

//   const removedProducts = await checkMonsantoRemovedProducts2(productCrossRefIds, cropType);

//   try {
//     await Promise.all(
//       removedProducts.map((item) => {
//         return MonsantoProduct.update(
//           {
//             isDeletedInBayer: true,
//           },
//           {
//             where: {
//               crossReferenceId: item,
//               isDeletedInBayer: false,
//             },
//           },
//         );
//       }),
//     );

//     await MonsantoPriceSheet.update(
//       {
//         isSyncing: false,
//         endRequestTimestamp: JSON.stringify(new Date().toISOString()),
//         lastUpdateDate: productLineItems.length > 0 ? JSON.stringify(new Date().toISOString()) : priceSheet.lastRequest,
//       },
//       {
//         where: {
//           buyerMonsantoId: seedDealerMonsantoId,
//           cropType,
//           zoneId,
//         },
//         transaction,
//       },
//     );

//     await transaction.commit();
//   } catch (err) {
//     console.log(err);

//     await transaction.rollback();
//     throw err;
//   }
// }

// async function checkMonsantoRemovedProducts2(productCrossRefIds, cropType) {
//   const AllMonsantoProducts = await MonsantoProduct.findAll({
//     where: {
//       classification: cropType,
//     },
//   });

//   const removedProduct = [];
//   AllMonsantoProducts.map((product) => {
//     if (!productCrossRefIds.includes(product.dataValues.crossReferenceId)) {
//       removedProduct.push(product.dataValues.crossReferenceId);
//     }
//   });
//   return removedProduct;
// }

process.env.IS_CRON_RUN === 'true' && job.start();
// process.env.IS_CRON_RUN === 'true' && job2.start();
module.exports = { job, updatePricesheet };

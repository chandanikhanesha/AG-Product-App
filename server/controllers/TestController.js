const { Router } = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const router = (module.exports = Router());
const path = require('path');

const {
  ApiSeedCompany,
  PurchaseOrder,
  Payment,
  MonsantoProduct,
  MonsantoProductLineItem,
  Backup,
  User,
  CustomerProduct,
  CustomerMonsantoProduct,
  CustomerCustomProduct,
  SeedCompany,
  Company,
  Product,
  CustomProduct,
} = require('models');
const request = require('request-promise');
const { pool } = require('config/connection');
const config = require('config').getConfig();
let priceSheetRes = [];
const {
  common: { parseXmlStringPromise },
  products: { parsePriceSheetResponse, buildPriceSheetRequest },
} = require('utilities/xml');
const { Op } = require('sequelize');

router.get('/', (req, res) => {
  res.json({ hello: 'world' });
});

router.post('/addNewSeasonProduct', async (req, res) => {
  console.log('import csv funxtion', req.body);
  const dataPath = path.resolve('newSeasonProduct.csv');

  console.log(req.body.organizationId, 'organizationId', typeof req.body.organizationId);

  let data = [];
  fs.createReadStream(dataPath)
    .pipe(csvParser())
    .on('data', async (row) => {
      data.push(row);
    })
    .on('end', async () => {
      console.log(data.length);
      if (typeof req.body.organizationId !== 'number') {
        req.body.organizationId.map(async (id, i) => {
          // setTimeout(async () => {
          const organizationId = parseInt(id);
          console.log(organizationId, 'organizationId');

          const apiseedcompanyData = await ApiSeedCompany.findOne({
            where: { organizationId: organizationId },
          });
          data
            .filter((row) => row.Classification !== 'A')
            .map(async (row, i) => {
              // console.log(row, 'row');
              setTimeout(async () => {
                const monsantoProductisExit = await MonsantoProduct.findOne({
                  where: {
                    organizationId: organizationId,
                  },
                  raw: true,
                });
                console.log(
                  apiseedcompanyData && !monsantoProductisExit,
                  'apiseedcompanyData && !monsantoProductisExit',
                  organizationId,
                );
                let packaging = null;

                if (row.ProductDetail.includes('30SCUSP')) {
                  packaging = '30SCUSP';
                } else if (row.ProductDetail.includes('40SCUMB')) {
                  packaging = '40SCUMB';
                } else if (row.ProductDetail.includes('50#')) {
                  packaging = '50#';
                } else if (row.ProductDetail.includes('80M')) {
                  packaging = '80M';
                } else if (row.ProductDetail.includes('140M')) {
                  packaging = '140M';
                } else if (row.ProductDetail.includes('4250M')) {
                  packaging = '4250M';
                } else if (row.ProductDetail.includes('SC-BULK-FG')) {
                  packaging = 'SC-BULK-FG';
                } else if (row.ProductDetail.includes('SP45')) {
                  packaging = 'SP45';
                } else if (row.ProductDetail.includes('SP50')) {
                  packaging = 'SP50';
                } else if (row.ProductDetail.includes('SP50U')) {
                  packaging = 'SP50U';
                } else if (row.ProductDetail.includes('50USP')) {
                  packaging = '50USP';
                }

                if (
                  apiseedcompanyData &&
                  (monsantoProductisExit
                    ? monsantoProductisExit.zoneId != `{${row.ZoneDescription}}`
                      ? true
                      : false
                    : !monsantoProductisExit)
                ) {
                  if (row.Classification === 'C') {
                    console.log(req.body.zone === row.ZoneDescription, req.body.zone, row.ZoneDescription);
                    if (req.body.zone === row.ZoneDescription) {
                      Promise.all([
                        MonsantoProduct.create({
                          organizationId: organizationId,
                          zoneId: [row.ZoneDescription],

                          seedCompanyId: apiseedcompanyData.dataValues.id,
                          isFavorite: false,
                          productDetail: row.ProductDetail,
                          classification: row.Classification,
                          seedSize: row.GradeSizeDesc,
                          brand: row.Brand,
                          blend: row.Blend,
                          treatment: row.Treatment,
                          crossReferenceId: row.GTINNumber,
                          isDeletedInBayer: false,
                          packaging: packaging,
                        }).then(async (res) => {
                          const monsantoProduct = await MonsantoProduct.findOne({
                            where: {
                              crossReferenceId: row.GTINNumber,
                              organizationId: organizationId,
                            },
                            raw: true,
                          });

                          if (monsantoProduct) {
                            const ZoneId =
                              monsantoProduct.classification === 'C'
                                ? req.body.zone
                                  ? req.body.zone
                                  : row.ZoneDescription
                                : row.ZoneDescription;

                            await MonsantoProductLineItem.create({
                              organizationId: organizationId,
                              productId: monsantoProduct.id,
                              crossReferenceProductId: monsantoProduct.crossReferenceId,
                              effectiveFrom: new Date(),
                              effectiveTo: new Date(),
                              suggestedDealerPrice: JSON.stringify({ [ZoneId]: row.suggestedDealerPrice }),
                              suggestedDealerCurrencyCode: JSON.stringify({ value: row.CurrencyCode }),
                              suggestedDealerMeasurementValue: 0,
                              suggestedDealerMeasurementUnitCode: JSON.stringify({ value: row.UnitCode }),
                              suggestedEndUserPrice: JSON.stringify({ [ZoneId]: row.suggestedEndUserPrice }),
                              suggestedEndUserCurrencyCode: JSON.stringify({ value: row.CurrencyCode }),
                              suggestedEndUserMeasurementValue: 0,
                              suggestedEndUserMeasurementUnitCode: JSON.stringify({ value: row.UnitCode }),
                              upcCode: row.UPCCode,
                              zoneId: [ZoneId],
                              cropType: monsantoProduct.classification,
                              lineNumber: 00,
                            });
                          }
                        }),
                      ]);
                    }
                  } else {
                    Promise.all([
                      MonsantoProduct.create({
                        organizationId: organizationId,
                        zoneId: [row.ZoneDescription],

                        seedCompanyId: apiseedcompanyData.dataValues.id,
                        isFavorite: false,
                        productDetail: row.ProductDetail,
                        classification: row.Classification,
                        seedSize: row.GradeSizeDesc,
                        brand: row.Brand,
                        blend: row.Blend,
                        treatment: row.Treatment,
                        crossReferenceId: row.GTINNumber,
                        isDeletedInBayer: false,
                        packaging: packaging,
                      })
                        .then(async () => {
                          const monsantoProduct = await MonsantoProduct.findOne({
                            where: {
                              crossReferenceId: row.GTINNumber,
                              organizationId: organizationId,
                            },
                            raw: true,
                          });

                          if (monsantoProduct) {
                            const ZoneId = row.ZoneDescription;

                            console.log('donee monsantoProduct', monsantoProduct.id, ZoneId);

                            await MonsantoProductLineItem.create({
                              organizationId: organizationId,
                              productId: monsantoProduct.id,
                              crossReferenceProductId: monsantoProduct.crossReferenceId,
                              effectiveFrom: new Date(),
                              effectiveTo: new Date(),
                              suggestedDealerPrice: JSON.stringify({ [ZoneId]: row.suggestedDealerPrice }),
                              suggestedDealerCurrencyCode: JSON.stringify({ value: row.CurrencyCode }),
                              suggestedDealerMeasurementValue: 1,
                              suggestedDealerMeasurementUnitCode: JSON.stringify({ value: row.UnitCode }),
                              suggestedEndUserPrice: JSON.stringify({ [ZoneId]: row.suggestedEndUserPrice }),
                              suggestedEndUserCurrencyCode: JSON.stringify({ value: row.CurrencyCode }),
                              suggestedEndUserMeasurementValue: 1,
                              suggestedEndUserMeasurementUnitCode: JSON.stringify({ value: row.UnitCode }),
                              upcCode: row.UPCCode,
                              zoneId: [ZoneId],
                              cropType: monsantoProduct.classification,
                              lineNumber: 00,
                            });
                          }
                        })
                        .catch((e) => {
                          console.log(e, 'e');
                        }),
                    ]);
                  }
                }
              }, 10 * i);
            });
          // }, 90000 * i);
        });
      } else {
        console.log('helllo single org', req.body.organizationId);

        console.log(data.length);
        const apiseedcompanyData = await ApiSeedCompany.findOne({
          where: { organizationId: req.body.organizationId },
        });

        data
          .filter((row) => row.Classification !== 'A')
          .map(async (row, i) => {
            // console.log(row, 'row');
            setTimeout(async () => {
              const monsantoProductisExit = await MonsantoProduct.findOne({
                where: {
                  crossReferenceId: row.GTINNumber,
                  organizationId: req.body.organizationId,
                },
                raw: true,
              });

              let packaging = null;

              if (row.ProductDetail.includes('30SCUSP')) {
                packaging = '30SCUSP';
              } else if (row.ProductDetail.includes('40SCUMB')) {
                packaging = '40SCUMB';
              } else if (row.ProductDetail.includes('50#')) {
                packaging = '50#';
              } else if (row.ProductDetail.includes('80M')) {
                packaging = '80M';
              } else if (row.ProductDetail.includes('140M')) {
                packaging = '140M';
              } else if (row.ProductDetail.includes('4250M')) {
                packaging = '4250M';
              } else if (row.ProductDetail.includes('SC-BULK-FG')) {
                packaging = 'SC-BULK-FG';
              } else if (row.ProductDetail.includes('SP45')) {
                packaging = 'SP45';
              } else if (row.ProductDetail.includes('SP50')) {
                packaging = 'SP50';
              } else if (row.ProductDetail.includes('SP50U')) {
                packaging = 'SP50U';
              } else if (row.ProductDetail.includes('50USP')) {
                packaging = '50USP';
              }

              if (
                apiseedcompanyData !== null &&
                (monsantoProductisExit
                  ? monsantoProductisExit.zoneId != `{${row.ZoneDescription}}`
                    ? true
                    : false
                  : !monsantoProductisExit)
              ) {
                if (row.Classification === 'C') {
                  console.log(req.body.zone === row.ZoneDescription, req.body.zone, row.ZoneDescription);
                  if (req.body.zone === row.ZoneDescription) {
                    Promise.all([
                      MonsantoProduct.create({
                        organizationId: req.body.organizationId,
                        zoneId: [row.ZoneDescription],

                        seedCompanyId: apiseedcompanyData.dataValues.id,
                        isFavorite: false,
                        productDetail: row.ProductDetail,
                        classification: row.Classification,
                        seedSize: row.GradeSizeDesc,
                        brand: row.Brand,
                        blend: row.Blend,
                        treatment: row.Treatment,
                        crossReferenceId: row.GTINNumber,
                        isDeletedInBayer: false,
                        packaging: packaging,
                      }).then(async (monsantoProduct) => {
                        if (monsantoProduct) {
                          const ZoneId =
                            monsantoProduct.classification === 'C'
                              ? req.body.zone
                                ? req.body.zone
                                : row.ZoneDescription
                              : row.ZoneDescription;

                          await MonsantoProductLineItem.create({
                            organizationId: req.body.organizationId,
                            productId: monsantoProduct.id,
                            crossReferenceProductId: monsantoProduct.crossReferenceId,
                            effectiveFrom: new Date(),
                            effectiveTo: new Date(),
                            suggestedDealerPrice: JSON.stringify({ [ZoneId]: row.suggestedDealerPrice }),
                            suggestedDealerCurrencyCode: JSON.stringify({ value: row.CurrencyCode }),
                            suggestedDealerMeasurementValue: 1,
                            suggestedDealerMeasurementUnitCode: JSON.stringify({ value: row.UnitCode }),
                            suggestedEndUserPrice: JSON.stringify({ [ZoneId]: row.suggestedEndUserPrice }),
                            suggestedEndUserCurrencyCode: JSON.stringify({ value: row.CurrencyCode }),
                            suggestedEndUserMeasurementValue: 1,
                            suggestedEndUserMeasurementUnitCode: JSON.stringify({ value: row.UnitCode }),
                            upcCode: row.UPCCode,
                            zoneId: [ZoneId],
                            cropType: monsantoProduct.classification,
                            lineNumber: 00,
                          });
                        }
                      }),
                    ]);
                  }
                } else {
                  Promise.all([
                    MonsantoProduct.create({
                      organizationId: req.body.organizationId,
                      zoneId: [row.ZoneDescription],

                      seedCompanyId: apiseedcompanyData.dataValues.id,
                      isFavorite: false,
                      productDetail: row.ProductDetail,
                      classification: row.Classification,
                      seedSize: row.GradeSizeDesc,
                      brand: row.Brand,
                      blend: row.Blend,
                      treatment: row.Treatment,
                      crossReferenceId: row.GTINNumber,
                      isDeletedInBayer: false,
                      packaging: packaging,
                    })
                      .then(async (monsantoProduct) => {
                        if (monsantoProduct) {
                          const ZoneId = row.ZoneDescription;

                          console.log('donee monsantoProduct', monsantoProduct.id, ZoneId);

                          await MonsantoProductLineItem.create({
                            organizationId: req.body.organizationId,
                            productId: monsantoProduct.id,
                            crossReferenceProductId: monsantoProduct.crossReferenceId,
                            effectiveFrom: new Date(),
                            effectiveTo: new Date(),
                            suggestedDealerPrice: JSON.stringify({ [ZoneId]: row.suggestedDealerPrice }),
                            suggestedDealerCurrencyCode: JSON.stringify({ value: row.CurrencyCode }),
                            suggestedDealerMeasurementValue: 0,
                            suggestedDealerMeasurementUnitCode: JSON.stringify({ value: row.UnitCode }),
                            suggestedEndUserPrice: JSON.stringify({ [ZoneId]: row.suggestedEndUserPrice }),
                            suggestedEndUserCurrencyCode: JSON.stringify({ value: row.CurrencyCode }),
                            suggestedEndUserMeasurementValue: 0,
                            suggestedEndUserMeasurementUnitCode: JSON.stringify({ value: row.UnitCode }),
                            upcCode: row.UPCCode,
                            zoneId: [ZoneId],
                            cropType: monsantoProduct.classification,
                            lineNumber: 00,
                          });
                        }
                      })
                      .catch((e) => {
                        console.log(e, 'e');
                      }),
                  ]);
                }
              }
            }, 10 * i);
          });
      }
    });
});

router.post('/checkPriceSheetData', async (req, res) => {
  try {
    const fetchPricesheetData = async (
      company,
      cropType,
      zoneId,
      seedDealerMonsantoId,
      seedCompanyId,
      organizationId,
      zoneIdLength,
      index,
    ) => {
      let lastRequest = process.env.PRICESHEETDEFAULTDATE;
      const promise = new Promise(async (resolve, reject) => {
        const currentUser = await User.findOne({
          where: {
            organizationId: organizationId,
          },
        });
        const dbProducts = await MonsantoProduct.findAll({
          where: {
            organizationId: organizationId,
            classification: cropType,
            zoneId: {
              [Op.contains]: [`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`],
            },
          },
          include: [
            {
              model: MonsantoProductLineItem,
              attributes: ['crossReferenceProductId', 'suggestedDealerPrice', 'suggestedEndUserPrice'],
              as: 'LineItem',
            },
          ],
          raw: true,
        });
        const finalData = [];

        const monsantoUserData = { dataValues: company };

        const priceSheetRequest = await buildPriceSheetRequest({
          user: currentUser,
          cropType,
          zoneId,
          seedDealerMonsantoId,
          lastRequest: lastRequest,
          seedCompanyId,
          monsantoUserData: monsantoUserData,
        });
        const xmlResponseString = await request.post(config.monsantoEndPoint, {
          'content-type': 'text/plain',
          body: priceSheetRequest,
        });

        const parsedString = await parseXmlStringPromise(xmlResponseString);
        const priceSheetData = await parsePriceSheetResponse(parsedString, cropType);
        const { productLineItems, identifier } = priceSheetData;

        const productIDs = new Set();
        const apiProducts = [];
        const productCrossRefIds = [];
        const lineItemUserPrice = [];

        productLineItems.forEach((lineItem) => {
          lineItemUserPrice.push({
            suggestedEndUserPrice: lineItem.suggestedEndUserPrice,
            suggestedDealerPrice: lineItem.suggestedDealerPrice,
            crossReferenceProductId: lineItem.crossReferenceProductId,
          });
          if (!productIDs.has(lineItem.product.AgiisId)) {
            productIDs.add(lineItem.product.AgiisId);
            apiProducts.push(lineItem.product);
            productCrossRefIds.push(lineItem.product.AgiisId);
          }
        });
        const APIProductNotInDB = apiProducts.filter(
          ({ AgiisId, zoneId: AzoneId }) =>
            !dbProducts.some(
              ({ crossReferenceId, zoneId: DzoneId }) =>
                crossReferenceId === AgiisId &&
                Array.isArray(AzoneId[0] ? AzoneId[0][0] : AzoneId[0]) ==
                  Array.isArray(DzoneId[0] ? DzoneId[0][0] : DzoneId[0]),
            ),
        );
        const DBProductNotInAPI = dbProducts.filter(
          ({ crossReferenceId: id1, zoneId: DzoneId }) =>
            !apiProducts.some(
              ({ AgiisId: id2, zoneId: AzoneId }) =>
                id2 === id1 &&
                Array.isArray(AzoneId[0] ? AzoneId[0][0] : AzoneId[0]) ==
                  Array.isArray(DzoneId[0] ? DzoneId[0][0] : DzoneId[0]),
            ),
        );
        const BothSame = dbProducts.filter(({ crossReferenceId: id1, zoneId: DzoneId }) =>
          apiProducts.some(
            ({ AgiisId: id2, zoneId: AzoneId }) =>
              id2 === id1 &&
              Array.isArray(AzoneId[0] ? AzoneId[0][0] : AzoneId[0]) ==
                Array.isArray(DzoneId[0] ? DzoneId[0][0] : DzoneId[0]),
          ),
        );
        finalData.push({ APIProductNotInDB: APIProductNotInDB, DBProductNotInAPI: DBProductNotInAPI });

        if (BothSame.length > 0) {
          const APIUserPriceNotInDB = lineItemUserPrice.filter(
            (id1) =>
              !BothSame.some(
                (id2) =>
                  id2.crossReferenceId === id1.crossReferenceProductId &&
                  id1.suggestedEndUserPrice ===
                    Object.values(JSON.parse(id2['LineItem.suggestedEndUserPrice'] || 0))[0] &&
                  id1.suggestedDealerPrice === Object.values(JSON.parse(id2['LineItem.suggestedDealerPrice'] || 0))[0],
              ),
          );

          const DBUserPriceNotInAPI = BothSame.filter(
            (id2) =>
              !lineItemUserPrice.some(
                (id1) =>
                  id2.crossReferenceId === id1.crossReferenceProductId &&
                  id1.suggestedEndUserPrice ===
                    Object.values(JSON.parse(id2['LineItem.suggestedEndUserPrice'] || 0))[0] &&
                  id1.suggestedDealerPrice === Object.values(JSON.parse(id2['LineItem.suggestedDealerPrice'] || 0))[0],
              ),
          );

          finalData.push({ APIUserPriceNotInDB: APIUserPriceNotInDB, DBUserPriceNotInAPI: DBUserPriceNotInAPI });
        }
        priceSheetRes.push({ [`${cropType}-${zoneId}-${organizationId}`]: finalData });

        console.log(organizationId, 'organizationId', index, '-----------------', zoneIdLength);

        if (index == zoneIdLength - 1) {
          console.log('resolve the function ');
          resolve();
        }
      });

      Promise.all([promise]).then(() => {
        console.log('complete the promise', priceSheetRes);
        fs.mkdir('./apiPriceSheetData', { recursive: true }, (error) => {
          if (error) {
            console.log(error);
          } else {
            console.log('New Directory created successfully !!');
            fs.writeFile(
              `./apiPriceSheetData/organizationId-${organizationId}.json`,
              JSON.stringify(priceSheetRes),
              function (err) {
                if (err) {
                  console.log(err);
                } else {
                  console.log('The file was saved!');
                  console.log('priceSheet none');
                  priceSheetRes = [];
                }
              },
            );
          }
        });
        return res.status(200).json(priceSheetRes);
      });
    };
    const apiseedCompany = await ApiSeedCompany.findAll();

    apiseedCompany.map(async (apiseedCompanys, i) => {
      const apiseedCompany = apiseedCompanys.dataValues;
      const finalZoneId = [];
      setTimeout(async () => {
        zoneIds = JSON.parse(apiseedCompany.zoneIds);

        console.log(apiseedCompany.organizationId, '-----------------organizationId----------------------');

        zoneIds.map((z) => {
          if (Array.isArray(z.zoneId)) {
            z.zoneId.map((zi) =>
              finalZoneId.push({
                classification: z.classification,
                zoneId: zi,
              }),
            );
          } else {
            finalZoneId.push({
              classification: z.classification,
              zoneId: z.zoneId,
            });
          }
        });

        console.log(finalZoneId, 'finalZoneId');
        await Promise.all(
          finalZoneId.map(async (item, i) => {
            const cropType = item.classification;

            const starZoneCropType = ['B'];
            const zoneId = starZoneCropType.includes(cropType) ? '*' : item.zoneId;

            fetchPricesheetData(
              apiseedCompany,
              cropType,
              zoneId == '*' ? 'NZI' : zoneId,
              apiseedCompany.technologyId,
              apiseedCompany.id,
              apiseedCompany.organizationId,
              finalZoneId.length,
              i,
            );
          }),
        );
      }, 80000 * i);
    });
  } catch (error) {
    if (error.message == 'No data found') {
      console.log('No need to request pricesheet because everything is already synced!');
      return res.status(200).json({ status: true });
    } else {
      console.log(error, 'error from fetch priceSheet');
      return res.status(400).json({ error: error.message });
    }
  }
});

// router.post('/checkPriceCSVSheetData', async (req, res) => {
//   // console.log(req.body.organizationId, 'organizationId', typeof req.body.organizationId);

//   try {
//     const fetchPricesheetData = async (
//       company,
//       cropType,
//       zoneId,
//       seedDealerMonsantoId,
//       seedCompanyId,
//       organizationId,
//     ) => {
//       const currentUser = await User.findOne({
//         where: {
//           organizationId: organizationId,
//         },
//       });

//       const promise = new Promise(async (resolve, reject) => {
//         const dbProducts = await MonsantoProduct.findAll({
//           where: {
//             organizationId: organizationId,
//             classification: cropType,
//             zoneId: {
//               [Op.contains]: [`${zoneId.toString() == '*' ? 'NZI' : zoneId.toString()}`],
//             },
//           },
//           include: [
//             {
//               model: MonsantoProductLineItem,
//               attributes: ['crossReferenceProductId', 'suggestedDealerPrice', 'suggestedEndUserPrice', 'upcCode'],
//               as: 'LineItem',
//             },
//           ],
//           raw: true,
//         });
//         const finalData = [];

//         const monsantoUserData = { dataValues: company.dataValues };

//         const dataPath = path.resolve('priceSheetApr12.csv');

//         const productLineItems = [];
//         await fs
//           .createReadStream(dataPath)
//           .on('error', (err) => {
//             console.log(err);
//             // handle error
//           })
//           .pipe(csvParser())
//           .on('data', async (row) => {
//             // console.log(zoneId, 'zoneId');
//             if (row.Specie == cropType && row.ZONECODE == zoneId) {
//               productLineItems.push(row);
//             }
//           })
//           .on('end', async () => {
//             console.log(productLineItems.length, 'productLineItems', cropType, zoneId);
//             const productIDs = new Set();
//             const apiProducts = [];
//             const productCrossRefIds = [];
//             const lineItemUserPrice = [];

//             productLineItems.forEach((lineItem) => {
//               lineItemUserPrice.push({
//                 suggestedEndUserPrice: lineItem.Growerprice,
//                 suggestedDealerPrice: lineItem.DealerPrice,
//                 crossReferenceProductId: lineItem.GTIN,
//               });
//               if (!productIDs.has(lineItem.GTIN)) {
//                 productIDs.add(lineItem.GTIN);
//                 apiProducts.push(lineItem);
//                 productCrossRefIds.push(lineItem.GTIN);
//               }
//             });

//             const APIProductNotInDB = apiProducts.filter(
//               ({ GTIN, ZONECODE: AzoneId }) =>
//                 !dbProducts.some(
//                   ({ crossReferenceId, zoneId: DzoneId }) =>
//                     crossReferenceId === GTIN && AzoneId == (Array.isArray(DzoneId[0]) ? DzoneId[0] : DzoneId),
//                 ),
//             );
//             const DBProductNotInAPI = dbProducts.filter(
//               ({ crossReferenceId: id1, zoneId: DzoneId }) =>
//                 !apiProducts.some(
//                   ({ GTIN: id2, ZONECODE: AzoneId }) =>
//                     id2 === id1 && AzoneId == (Array.isArray(DzoneId[0]) ? DzoneId[0] : DzoneId),
//                 ),
//             );
//             const BothSame = dbProducts.filter(({ crossReferenceId: id1, zoneId: DzoneId }) =>
//               apiProducts.some(
//                 ({ GTIN: id2, ZONECODE: AzoneId }) =>
//                   id2 === id1 && AzoneId == (Array.isArray(DzoneId[0]) ? DzoneId[0] : DzoneId),
//               ),
//             );
//             finalData.push({ APIProductNotInDB: APIProductNotInDB, DBProductNotInAPI: DBProductNotInAPI });
//             // console.log(BothSame.length, 'BothSame');

//             //we've to cehck UPCCode ,Description[productDetail] ,TraitDescription [brand],TreatmentDescription ,AcronymName[blend]
//             if (BothSame.length > 0) {
//               const APIUserPriceNotInDB = lineItemUserPrice.filter(
//                 (id1) =>
//                   !BothSame.some(
//                     (id2) =>
//                       id2.crossReferenceId === id1.crossReferenceProductId &&
//                       id1.suggestedEndUserPrice ===
//                         Object.values(JSON.parse(id2['LineItem.suggestedEndUserPrice'] || 0))[0] &&
//                       id1.suggestedDealerPrice ===
//                         Object.values(JSON.parse(id2['LineItem.suggestedDealerPrice'] || 0))[0],
//                   ),
//               );

//               const DBUserPriceNotInAPI = BothSame.filter(
//                 (id2) =>
//                   !lineItemUserPrice.some(
//                     (id1) =>
//                       id2.crossReferenceId === id1.crossReferenceProductId &&
//                       id1.suggestedEndUserPrice ===
//                         Object.values(JSON.parse(id2['LineItem.suggestedEndUserPrice'] || 0))[0] &&
//                       id1.suggestedDealerPrice ===
//                         Object.values(JSON.parse(id2['LineItem.suggestedDealerPrice'] || 0))[0],
//                   ),
//               );

//               const APIProdcutDetailNotInDB = productLineItems.filter(
//                 (id1) =>
//                   !BothSame.some((id2) => id2.crossReferenceId === id1.GTIN && id2.productDetail == id1.Description),
//               );
//               const DBProdcutDetailNotInAPI = BothSame.filter(
//                 (id2) =>
//                   !productLineItems.some(
//                     (id1) => id2.crossReferenceId === id1.GTIN && id2.productDetail == id1.Description,
//                   ),
//               );
//               const APITraitNotInDB = productLineItems.filter(
//                 (id1) => !BothSame.some((id2) => id2.crossReferenceId === id1.GTIN && id2.blend == id1.AcronymName),
//               );
//               const DBTraitNotInAPI = BothSame.filter(
//                 (id2) =>
//                   !productLineItems.some((id1) => id2.crossReferenceId === id1.GTIN && id2.blend == id1.AcronymName),
//               );
//               const APIUPCCodeNotInDB = productLineItems.filter(
//                 (id1) =>
//                   !BothSame.some((id2) => id2.crossReferenceId === id1.GTIN && id2['LineItem.upcCode'] == id1.UPCCode),
//               );
//               const DBUPCCodeNotInAPI = BothSame.filter(
//                 (id2) =>
//                   !productLineItems.some(
//                     (id1) => id2.crossReferenceId === id1.GTIN && id2['LineItem.upcCode'] == id1.UPCCode,
//                   ),
//               );

//               const APITreatmentNotInDB = productLineItems.filter(
//                 (id1) =>
//                   !BothSame.some(
//                     (id2) => id2.crossReferenceId === id1.GTIN && id2.treatment == id1.TreatmentDescription,
//                   ),
//               );
//               const DBTreatmentNotInAPI = BothSame.filter(
//                 (id2) =>
//                   !productLineItems.some(
//                     (id1) => id2.crossReferenceId === id1.GTIN && id2.treatment == id1.TreatmentDescription,
//                   ),
//               );
//               finalData.push({
//                 APIUserPriceNotInDB: APIUserPriceNotInDB,
//                 DBUserPriceNotInAPI: DBUserPriceNotInAPI,
//                 APIProdcutDetailNotInDB: APIProdcutDetailNotInDB,
//                 DBProdcutDetailNotInAPI: DBProdcutDetailNotInAPI,
//                 APITraitNotInDB: APITraitNotInDB,
//                 DBTraitNotInAPI: DBTraitNotInAPI,
//                 APIUPCCodeNotInDB: APIUPCCodeNotInDB,
//                 DBUPCCodeNotInAPI: DBUPCCodeNotInAPI,
//                 APITreatmentNotInDB: APITreatmentNotInDB,
//                 DBTreatmentNotInAPI: DBTreatmentNotInAPI,
//               });
//             }
//             console.log(priceSheetRes.length);
//             priceSheetRes.push({ [`${cropType}-${zoneId}`]: finalData });

//             if (priceSheetRes.length == 6) {
//               console.log('resolve the function ');
//               resolve();
//             }
//           });
//       });

//       Promise.all([promise]).then(() => {
//         fs.mkdir('./CSVPriceSheetData', { recursive: true }, (error) => {
//           if (error) {
//             console.log(error);
//           } else {
//             console.log('New Directory created successfully !!');
//             fs.writeFile(
//               `./CSVPriceSheetData/organizationId-${organizationId}.json`,
//               JSON.stringify(priceSheetRes),
//               function (err) {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                   console.log('The file was saved!');
//                 }
//               },
//             );
//           }
//         });

//         // console.log('complete the promise', priceSheetRes);
//         // return res.status(200).json(priceSheetRes);
//       });
//     };
//     const apiseedCompany = await ApiSeedCompany.findAll();
//     console.log(apiseedCompany.length, '-----------------------');

//     apiseedCompany.map(async (apiseedCompany, i) => {
//       setTimeout(async () => {
//         zoneIds = JSON.parse(apiseedCompany.dataValues.zoneIds);

//         console.log(apiseedCompany.dataValues.organizationId, 'organizationId');
//         await Promise.all(
//           zoneIds.map(async (item, i) => {
//             const cropType = item.classification;

//             const starZoneCropType = ['B'];
//             const zoneId = starZoneCropType.includes(cropType) ? '*' : item.zoneId;

//             if (Array.isArray(zoneId)) {
//               await Promise.all(
//                 zoneId.map(async (zone) => {
//                   fetchPricesheetData(
//                     apiseedCompany,
//                     cropType,
//                     zone,
//                     apiseedCompany.dataValues.technologyId,
//                     apiseedCompany.dataValues.id,
//                     apiseedCompany.dataValues.organizationId,
//                     i,
//                   );
//                 }),
//               );
//             } else {
//               fetchPricesheetData(
//                 apiseedCompany,
//                 cropType,
//                 zoneId == '*' ? 'NZI' : zoneId,
//                 apiseedCompany.dataValues.technologyId,
//                 apiseedCompany.dataValues.id,
//                 apiseedCompany.dataValues.organizationId,
//                 i,
//               );
//             }
//           }),
//         );
//       }, 20000 * i);
//     });
//   } catch (error) {
//     if (error.message == 'No data found') {
//       console.log('No need to request pricesheet because everything is already synced!');
//       return res.status(200).json({ status: true });
//     } else {
//       console.log(error.message, 'error from fetch priceSheet');
//       return res.status(400).json({ error: error.message });
//     }
//   }
// });
router.get('/getQueryData/:id', async (req, res, next) => {
  const organizationId = req.params.id;
  console.log(organizationId, 'organizationId');
  let poData = {};
  let deliveryData = {};
  let gposData = {};
  // -- get all PO products
  await Promise.all([
    await pool.query(
      ` select cu.name, mp."productDetail", cmp."monsantoProductId", cmp."purchaseOrderId", cmp."orderQty", cmp."isSent"  from "CustomerMonsantoProducts" cmp
    left outer join "MonsantoProducts" mp on mp.id = cmp."monsantoProductId"
    left outer join "PurchaseOrders" po on po.id = cmp."purchaseOrderId"
    left outer join "Customers" cu on cu.id = po."customerId"
  where cmp."isDeleted" = false and cmp."organizationId" = ${organizationId} and po."isDeleted" = false and po."isQuote" = false
   order by  cmp."PurchaseOrderId" `,
      async (err, resData) => {
        console.log(err, 'err');
        console.log(resData, 'resData.rows');
        if (resData && resData.rows) {
          return (poData = resData.rows);
        }
      },
    ),

    // -- get all PO deliveries
    await pool.query(
      `  select drd."monsantoProductId", dr."purchaseOrderId", drd."amountDelivered" from "DeliveryReceiptDetails" drd
           left outer join "MonsantoProducts" mp on mp.id = drd."monsantoProductId"
          left outer join "DeliveryReceipts" dr on dr.id = drd."deliveryReceiptId"
           left outer join "PurchaseOrders" po on po.id = dr."purchaseOrderId"
           left outer join "Customers" cu on cu.id = po."customerId"
         where dr."isDeleted" = false and dr."organizationId" = ${organizationId} and po."isDeleted" = false and po."isQuote" = false and drd."isDeleted" = false
          order by  dr."purchaseOrderId" `,
      async (err, resData) => {
        if (resData && resData.rows) {
          return (deliveryData = resData.rows);
        }
      },
    ),

    // -- get all GPOS
    await pool.query(
      ` select mp.id, ntg.streportedname, ntg.productreportedquantity, ntg.purchaseorderid from "TempGPOS" ntg
     left outer join "PurchaseOrders" po on po.id = ntg.purchaseorderid::DECIMAL
     left outer join "MonsantoProducts" mp on mp."crossReferenceId" = ntg.productreportedvalue
     where po."isDeleted" = false and po."isQuote" = false and po."OrganizationId" = ${organizationId} and mp."OrganizationId" = ${organizationId} and ntg.transactionstatus = 'CLOSED' order by ntg.purchaseorderid`,
      async (err, resData) => {
        if (resData && resData.rows) {
          return (gposData = resData.rows);
        }
      },
    ),
  ]).then(() => {
    setTimeout(() => {
      res.json({ poData, gposData, deliveryData });
    }, 3000);
  });
});

router.post('/negativeGPOS', async (req, res) => {
  try {
    const { id } = req.body;

    console.log(id, 'id');

    req.body.ids.map(async (tempid, i) => {
      setTimeout(async function () {
        console.log(tempid, 'tempid');
        const tempGPOSData = await TempGPOS.findOne({ where: { id: tempid }, raw: true });
        const organization = await Organization.findOne({
          where: { name: tempGPOSData.ReporterReportedName },
          raw: true,
        });

        const monsantoUserData = await ApiSeedCompany.findOne({
          where: { OrganizationId: organization.id },
          raw: true,
        });
        const po = await PurchaseOrder.findOne({ where: { id: tempGPOSData.purchaseOrderId }, raw: true });

        const customerData = await Customer.findOne({ where: { id: po.customerId, isArchive: false }, raw: true });

        console.log(tempGPOSData.ProductReportedValue, 'tempGPOSData.ProductReportedValue');
        const productName = await MonsantoProduct.findOne({
          where: {
            crossReferenceId: {
              [Op.like]: `%${tempGPOSData.ProductReportedValue}`,
            },

            OrganizationId: organization.id,
          },
          include: [
            {
              model: MonsantoProductLineItem,
              as: 'LineItem',
              attributes: ['suggestedDealerMeasurementUnitCode', 'lineNumber'],
            },
          ],
          raw: true,
        });

        const ProductLineItems = [
          {
            ProductName: productName.productDetail,
            ProductId: productName.crossReferenceId,
            ProductQuantity: {
              MeasurementValue: tempGPOSData.ProductReportedQuantity,
              Domain: JSON.parse(productName['LineItem.suggestedDealerMeasurementUnitCode']).domain,
              text: JSON.parse(productName['LineItem.suggestedDealerMeasurementUnitCode']).value,
            },
            LineNumber: tempGPOSData.IndivisualDeliveryId.split('D')[1].split('-')[0],
          },
        ];
        const InvoiceNumber = tempGPOSData.ReportedInvoiceNumber;

        const isReturn = true;
        const productTransactions = [{ InvoiceNumber, ProductLineItems }];
        console.log(productTransactions, 'productTransactions');
        const xmlStringRequest = await buildproductMovementReportRequest({
          seedDealerMonsantoId: monsantoUserData.dataValues.glnId,
          organizationName: organization.dataValues.name,
          productTransactions,
          monsantoUserData,
          customerData: customerData.dataValues,
          isReturn,
          invoiceDate: po.dataValues.createdAt,
        });
        await request
          .post(config.monsantoEndPoint, {
            'content-type': 'text/plain',
            body: xmlStringRequest,
          })
          .then(async (response) => {
            const responseString = await parseXmlStringPromise(response);
            if (responseString) {
              TempGPOS.update({ apiResponse: 'Negative value GPOS response SUccesfully' }, { where: { id: tempid } });

              res.status(200).send({ success: responseString });
            }
          })
          .catch(async (e) => {
            console.log(`error at product movment ${e}`);
            const errorXmL = await parseXmlStringPromise(e.response.body);
            const errorString = parseShipNoticeError(errorXmL);
            TempGPOS.update(
              { apiResponse: errorString || 'The proxy server could not handle the request ' },
              { where: { id: tempid } },
            );

            return res.status(503).json({
              error: errorString || 'The proxy server could not handle the request ',
            });
          });
      }, i * 5000);
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({ error: 'Error while doing nagative GPOS' });
  }
});

router.post('/updateRawOfPayment', async (req, res) => {
  const allPO = await PurchaseOrder.all({
    where: {
      isDeleted: false,
      isQuote: false,
    },
    attributes: ['id', 'organizationId', 'isQuote'],
    include: [
      {
        model: CustomerProduct,
        attributes: ['id'],
        include: [
          {
            model: Product,
            attributes: ['id'],

            include: [
              {
                model: SeedCompany,
                as: 'SeedCompany',
                attributes: ['id'],
              },
            ],
          },
        ],
      },
      {
        model: CustomerMonsantoProduct,
        // where: { isDeleted: false },
        attributes: ['id'],

        include: [
          {
            model: MonsantoProduct,
            attributes: ['id'],
            include: [{ model: ApiSeedCompany, attributes: ['id'] }],
          },
        ],
      },
      {
        model: CustomerCustomProduct,
        // where: { isDeleted: false },
        attributes: ['id'],

        include: [
          {
            model: CustomProduct,
            attributes: ['id'],

            include: [{ model: Company, as: 'Company', attributes: ['id'] }],
          },
        ],
      },
      {
        model: Payment,
      },
    ],
  });
  let data = [];
  let i = 0;
  await allPO.map(async (po) => {
    const p = po.dataValues;

    if (
      p.CustomerProducts.length > 0 &&
      p.CustomerMonsantoProducts.length == 0 &&
      p.CustomerCustomProducts.length == 0
    ) {
      const apiSeedId = p.CustomerProducts[0].dataValues.Product.dataValues.SeedCompany.dataValues.id;
      updatePayment(p.id, apiSeedId, 'SeedCompany');
    } else if (
      p.CustomerProducts.length == 0 &&
      p.CustomerMonsantoProducts.length == 0 &&
      p.CustomerCustomProducts.length > 0
    ) {
      const apiSeedId = p.CustomerCustomProducts[0].dataValues.CustomProduct.dataValues.Company.dataValues.id;
      updatePayment(p.id, apiSeedId, 'RegularCompany');
    } else if (
      p.CustomerProducts.length == 0 &&
      p.CustomerMonsantoProducts.length > 0 &&
      p.CustomerCustomProducts.length == 0
    ) {
      const apiSeedId =
        p.CustomerMonsantoProducts[0].dataValues.MonsantoProduct.dataValues.ApiSeedCompany.dataValues.id;
      updatePayment(p.id, apiSeedId, 'Bayer');
    } else if (p.Payments.length > 0) {
      i = i + 1;

      await data.push({ organizationId: p.organizationId, POId: p.id });

      console.log("this payment's have multiple product", p.id, p.organizationId);
    }
  });

  setTimeout(() => {
    res.json({ paymentWithMultipleCompany: data, length: i });
  }, 5000);
  console.log(allPO.length, 'allPO');
  console.log(data, 'data');
});

const updatePayment = async (pId, cId, cName) => {
  await Payment.update(
    { companyId: 0, companyType: null },
    {
      where: {
        purchaseOrderId: pId,
        companyId: {
          [Op.eq]: null,
        },
      },
      returning: true,
    },
  )
    .then(async (res) => {
      const data = res.length == 2 && res[1][0];
      if (data && res[0] == 1) {
        const multiCompanyData =
          data.dataValues.multiCompanyData.length == 0
            ? [{ companyId: cId, companyName: cName, amount: data.dataValues.amount, multiNote: '' }]
            : [
                ...data.dataValues.multiCompanyData,
                { companyId: cId, companyName: cName, amount: data.dataValues.amount, multiNote: '' },
              ];

        await Payment.update(
          { companyId: 0, companyType: null, multiCompanyData: multiCompanyData },
          {
            where: {
              id: data.dataValues.id,
            },
          },
        ).then((res) => {
          console.log('done update payment');
        });
      }
    })
    .catch((err) => {
      console.log('got the error', err);
    });
};
router.post('/addPackagingProducts', async (req, res) => {
  let newMonsantoProductData = [
    {
      classification: 'P',
      productDetail: 'PALET-M 54X40IN 2WAY 4STRINGER FLUSH MON',
      crossReferenceId: '00070183889549',
      quantity: 0,
    },
    {
      classification: 'P',
      productDetail: 'PALET-M 40X40IN 2WAY DOMESTIC',
      crossReferenceId: '00070183889501',
      quantity: 0,
    },
    {
      classification: 'P',
      productDetail: 'PALET-M 54X40IN 2WAY 3STRINGER DOMESTIC',
      crossReferenceId: '00070183889532',
      quantity: 0,
    },
    {
      classification: 'P',
      productDetail: 'NEW-RIBC,CENTERFLOW,COTTON,SEEDPAK',
      crossReferenceId: '00883580161725',
      quantity: 0,
    },
    {
      classification: 'P',
      productDetail: 'NRIBC,CENTERFLOW,BLACK,SORGHUM,SEEDPAK50',
      crossReferenceId: '00883580159951',
      quantity: 0,
    },
    {
      classification: 'P',
      productDetail: 'RETPE-M COMMERCIAL SEEDPAK IBCPE ASGROW',
      crossReferenceId: '00888346821530',
      quantity: 0,
    },
    {
      classification: 'P',
      productDetail: 'RETPE-M CENTER FLOW BLACK IBC SP NEW ',
      crossReferenceId: '00883580161718',
      quantity: 0,
    },
  ];
  await ApiSeedCompany.findAll().then(async (apiSeedCompanies) => {
    apiSeedCompanies.forEach(async (apiSeedCompanie) => {
      try {
        if (Array.isArray(newMonsantoProductData)) {
          let customerListPromises = [];
          for (let i = 0; i < newMonsantoProductData.length; i++) {
            const abc = await MonsantoProduct.create({
              ...newMonsantoProductData[i],
              organizationId: apiSeedCompanie.organizationId,
              zoneId: ['NZI'],
              isDeletedInBayer: false,
              seedCompanyId: apiSeedCompanie.id,
            }).then(async (product) => {
              await MonsantoProductLineItem.create({
                organizationId: product.dataValues.organizationId,
                crossReferenceProductId: product.dataValues.crossReferenceId,
                productId: product.dataValues.id,
                cropType: 'P',
                lineNumber: '999999',
                effectiveFrom: new Date(),
                effectiveTo: new Date(),
                suggestedDealerPrice: '{"NZI":"0"}',
                suggestedDealerCurrencyCode: '{"value":"USD","domain":"ISO-4217"}',
                suggestedDealerMeasurementValue: 1,
                suggestedDealerMeasurementUnitCode: '{"value":"BG","domain":"UN-Rec-20"}',
                suggestedEndUserPrice: '{"NZI":"0"}',
                suggestedEndUserCurrencyCode: '{"value":"USD","domain":"ISO-4217"}',
                suggestedEndUserMeasurementValue: 1,
                suggestedEndUserMeasurementUnitCode: '{"value":"UN","domain":"UN-Rec-20"}',
                zoneId: ['NZI'],
              });
            });
            customerListPromises.push(abc);
          }

          Promise.all(customerListPromises)
            .then((data) => {
              res.json('done');
            })
            .catch((err) => {
              console.log('ee2: ', err);
              // return res.status(422).json({ error: 'Error creating customers' });
            });
        } else {
        }
      } catch (e) {
        console.log('ee3: ', e);
        // return res.status(422).json({ error: 'Error creating customer' });
      }
    });
  });
});

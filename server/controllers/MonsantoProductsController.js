const {
  MonsantoProduct,
  MonsantoProductLineItem,
  sequelize,
  MonsantoLot,
  DeliveryReceiptDetails,
  ProductDealer,
  Organization,
  ApiSeedCompany,
} = require('models');
const { Op } = require('sequelize');
module.exports.list = (req, res, next) => {
  let query = {
    where: {
      organizationId: req.user.organizationId,
      ...(req.body.seedCompanyId && { seedCompanyId: req.body.seedCompanyId }),
      ...(req.body.cropType && { classification: req.body.cropType }),
      // isDeleted: false
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
    ...(req.query.limit && { limit: req.query.limit }),
    offset: req.query.skip || 0,
  };

  return MonsantoProduct.all(query)
    .then((products) => {
      products.forEach((product) => {
        // product.dataValues.lots = product.dataValues.lots.filter(lot => !lot.isDeleted)
        product.dataValues.lots = product.dataValues.monsantoLots;
        delete product.dataValues.monsantoLots;
      });
      return res.json({ items: products });
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching product' });
    });
};

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

module.exports.updateMonsantoProduct = async (req, res) => {
  try {
    const data = req.body;
    const { removeMe, lotId, id } = data;
    var query = {
      where: {
        organizationId: req.user.organizationId,
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
      ...(req.query.limit && { limit: req.query.limit }),
      offset: req.query.skip || 0,
    };

    const checkLot = MonsantoLot.findOne({
      where: {
        id: id,
      },
    });

    const checkTransferId = await MonsantoLot.findOne({
      where: {
        transferId: data.transferId,
      },
    });

    if (id !== undefined || lotId !== undefined) {
      if (removeMe) {
        DeliveryReceiptDetails.destroy({ where: { monsantoLotId: lotId || id } }).then((data) => {
          MonsantoLot.destroy({ where: { id: lotId || id } }).then(() => {
            return MonsantoProduct.all(query).then((products) => {
              products.forEach((product) => {
                product.dataValues.lots = product.dataValues.monsantoLots;
                delete product.dataValues.monsantoLots;
              });
              return res.json({ items: products });
            });
          });
        });
      } else {
        MonsantoLot.update(req.body, { where: { id: id } })
          .then((data) => {
            return MonsantoProduct.all(query).then((products) => {
              products.forEach((product) => {
                product.dataValues.lots = product.dataValues.monsantoLots;
                delete product.dataValues.monsantoLots;
              });
              return res.json({ items: products });
            });
          })
          .catch((e) => {
            console.log('error : ', e);
            res.status(422).json({ error: 'Error updating Lot' });
          });
      }
    } else {
      if (!checkTransferId) {
        const dealer = await ProductDealer.findOne({
          where: {
            name: data.dealerName,
          },
          raw: true,
        });
        const isCrossRefId = await MonsantoProduct.findOne({
          where: {
            organizationId: req.user.organizationId,
            crossReferenceId: { [Op.like]: `%${data.crossReferenceId}` },
          },
          raw: true,
        });

        const isProductDetail = await MonsantoProduct.findOne({
          where: {
            organizationId: req.user.organizationId,
            productDetail: data.productDetail,
          },
          raw: true,
        });

        if (isCrossRefId !== null || isProductDetail !== null) {
          MonsantoLot.create({
            quantity: data.quantity,
            receivedQty: data.receivedQty,
            organizationId: req.user.organizationId,
            lotNumber: data.lotNumber ? data.lotNumber : null,
            monsantoProductId: data.monsantoProductId,
            source: data.source,
            dealerName: data.dealerName,
            crossReferenceId: isCrossRefId !== null ? isCrossRefId.crossReferenceId : isProductDetail.crossReferenceId,
            dealerId: data.dealerId ? data.dealerId : dealer ? dealer.id : null,
            shipDate: data.shipDate,
            isReturn: data.isReturn,
            netWeight: data.netWeight,
            isAccepted: data.isAccepted,
            deliveryDate: data.deliveryDate,
            transferId: data.transferId,
            shipNotice: data.shipNotice,
          })
            .then((data) => {
              return MonsantoProduct.all(query).then((products) => {
                products.forEach((product) => {
                  // product.dataValues.lots = product.dataValues.lots.filter(lot => !lot.isDeleted)
                  product.dataValues.lots = product.dataValues.monsantoLots;
                  delete product.dataValues.monsantoLots;
                });
                return res.json({ items: products });
              });
            })
            .catch((e) => {
              console.log('error : ', e);
              res.status(422).json({ error: 'Error creating Lot' });
            });
        } else {
          res.status(422).json({ error: 'Error creating Lot' });
        }
      } else {
        res.status(404).json({ error: `TransferId already exits` });
      }
    }
  } catch (err) {
    console.log('----------------------errr', err);
    res.status(500).json({ error: `Unable to update product: ${err}` });
  }
};

// module.exports.addPackagingProducts = async (req, res, next) => {
//   // if (!Array.isArray(req.body)) return res.status(422).json({ errors: 'Not all parameters present' });
//   let newMonsantoProductData = [
//     {
//       classification: 'P',
//       productDetail: 'PALET-M 54X40IN 2WAY 4STRINGER FLUSH MON',
//       crossReferenceId: '00070183889549',
//       quantity: 0,
//     },
//     {
//       classification: 'P',
//       productDetail: 'PALET-M 40X40IN 2WAY DOMESTIC',
//       crossReferenceId: '00070183889501',
//       quantity: 0,
//     },
//     {
//       classification: 'P',
//       productDetail: 'PALET-M 54X40IN 2WAY 3STRINGER DOMESTIC',
//       crossReferenceId: '00070183889532',
//       quantity: 0,
//     },
//     {
//       classification: 'P',
//       productDetail: 'NEW-RIBC,CENTERFLOW,COTTON,SEEDPAK',
//       crossReferenceId: '00883580161725',
//       quantity: 0,
//     },
//     {
//       classification: 'P',
//       productDetail: 'NRIBC,CENTERFLOW,BLACK,SORGHUM,SEEDPAK50',
//       crossReferenceId: '00883580159951',
//       quantity: 0,
//     },
//     {
//       classification: 'P',
//       productDetail: 'RETPE-M COMMERCIAL SEEDPAK IBCPE ASGROW',
//       crossReferenceId: '00888346821530',
//       quantity: 0,
//     },
//     {
//       classification: 'P',
//       productDetail: 'RETPE-M CENTER FLOW BLACK IBC SP NEW ',
//       crossReferenceId: '00883580161718',
//       quantity: 0,
//     },
//   ];
//   await ApiSeedCompany.findAll().then(async (apiSeedCompanies) => {
//     apiSeedCompanies.forEach(async (apiSeedCompanie) => {
//       try {
//         if (Array.isArray(newMonsantoProductData)) {
//           let customerListPromises = [];
//           for (let i = 0; i < newMonsantoProductData.length; i++) {
//             const abc = await MonsantoProduct.create({
//               ...newMonsantoProductData[i],
//               organizationId: apiSeedCompanie.organizationId,
//               zoneId: ['NZI'],
//               isDeletedInBayer: false,
//               seedCompanyId: apiSeedCompanie.id,
//             }).then(async (product) => {
//               await MonsantoProductLineItem.create({
//                 organizationId: product.dataValues.organizationId,
//                 crossReferenceProductId: product.dataValues.crossReferenceId,
//                 productId: product.dataValues.id,
//                 cropType: 'P',
//                 lineNumber: '999999',
//                 effectiveFrom: new Date(),
//                 effectiveTo: new Date(),
//                 suggestedDealerPrice: '{"NZI":"0"}',
//                 suggestedDealerCurrencyCode: '{"value":"USD","domain":"ISO-4217"}',
//                 suggestedDealerMeasurementValue: 1,
//                 suggestedDealerMeasurementUnitCode: '{"value":"BG","domain":"UN-Rec-20"}',
//                 suggestedEndUserPrice: '{"NZI":"0"}',
//                 suggestedEndUserCurrencyCode: '{"value":"USD","domain":"ISO-4217"}',
//                 suggestedEndUserMeasurementValue: 1,
//                 suggestedEndUserMeasurementUnitCode: '{"value":"UN","domain":"UN-Rec-20"}',
//                 zoneId: ['NZI'],
//               });
//             });
//             customerListPromises.push(abc);
//           }

//           Promise.all(customerListPromises)
//             .then((data) => {
//               res.json('done');
//             })
//             .catch((err) => {
//               console.log('ee2: ', err);
//               // return res.status(422).json({ error: 'Error creating customers' });
//             });
//         } else {
//         }
//       } catch (e) {
//         console.log('ee3: ', e);
//         // return res.status(422).json({ error: 'Error creating customer' });
//       }
//     });
//   });
// };

module.exports.listPackagingProducts = (req, res, next) => {
  let query = {
    where: {
      organizationId: req.user.organizationId,
      // isDeleted: false
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
  };
  let packingProduct = [];
  return MonsantoProduct.all(query)
    .then((products) => {
      products
        .filter((product) => product.classification === 'P')
        .forEach((product) => {
          // product.dataValues.lots = product.dataValues.lots.filter(lot => !lot.isDeleted)
          product.dataValues.lots = product.dataValues.monsantoLots;
          delete product.dataValues.monsantoLots;
          packingProduct.push({
            Product: product,

            productId: product.dataValues.id,
            productDetail: product.dataValues.productDetail,
          });
        });

      return res.json({ items: packingProduct });
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching product' });
    });
};

// addPackagingProducts();

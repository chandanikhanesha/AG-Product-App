const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const {
  ApiSeedCompany,
  MonsantoProductLineItem,
  MonsantoProduct,
  MonsantoRetailerOrderSummary,
  MonsantoRetailerOrderSummaryProduct,
  // sequelize,
  Customer,
  PurchaseOrder,
  MonsantoFavoriteProduct,
  Subscriptions,
  Organization,
} = require('models');
const { filterDeletedListResponse } = require('utilities');

// manage in production
const cropTypeMap = {
  corn: 'C',
  sorghum: 'S',
  soybean: 'B',
  // alfalfa: 'A',
  canola: 'L',
  packaging: 'P',
};

const mapObj = {
  C: 'CORN',
  B: 'SOYBEAN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
  P: 'PACKAGING',
};

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  ApiSeedCompany.all({
    where: {
      organizationId: req.user.organizationId,
      isDeleted: false,
    },
    include: [
      {
        model: MonsantoProduct,
        attributes: [
          'id',
          'brand',
          'blend',
          'treatment',
          'classification',
          'seedSize',
          'packaging',
          'seedCompanyId',
          'crossReferenceId',
          'quantity',
          'isFavorite',
          'productDetail',
          'zoneId',
        ],
        as: 'Products',
        separate: true,
        include: [
          {
            model: MonsantoProductLineItem,
            attributes: [
              'id',
              'suggestedDealerPrice',
              'suggestedEndUserPrice',
              'suggestedDealerMeasurementUnitCode',
              'suggestedDealerMeasurementValue',
              'effectiveFrom',
              'effectiveTo',
              'zoneId',
            ],
            as: 'LineItem',
            // where: {
            //   $and: [
            //     {
            //       effectiveFrom: {
            //         $lte: new Date(),
            //       },
            //     },
            //     {
            //       effectiveTo: {
            //         $gte: new Date(),
            //       },
            //     },
            //   ],
            // },
          },
        ],
      },
      {
        model: MonsantoFavoriteProduct,
        as: 'MonsantoFavoriteProducts',
        separate: true,
        include: [
          {
            model: MonsantoProduct,
            attributes: [
              'id',
              'brand',
              'blend',
              'treatment',
              'classification',
              'seedSize',
              'packaging',
              'seedCompanyId',
              'crossReferenceId',
            ],
            as: 'Product',
            include: [
              {
                model: MonsantoProductLineItem,
                attributes: [
                  'id',
                  'suggestedDealerPrice',
                  'suggestedDealerMeasurementUnitCode',
                  'suggestedDealerMeasurementValue',
                  'effectiveFrom',
                  'effectiveTo',
                ],
                as: 'LineItem',
                // where: {
                //   $and: [
                //     {
                //       effectiveFrom: {
                //         $lte: new Date(),
                //       },
                //     },
                //     {
                //       effectiveTo: {
                //         $gte: new Date(),
                //       },
                //     },
                //   ],
                // },
              },
            ],
          },
        ],
      },
    ],
  })
    .then(async (apiSeedCompanies) => {
      const returningApiSeedCompanies = await Promise.all(
        apiSeedCompanies.map(async (apiSeedCompany) => {
          let summaryProducts = [];
          let result = [];
          const summary = await MonsantoRetailerOrderSummary.findOne({
            where: { buyerMonsantoId: apiSeedCompany.technologyId },
          });

          // console.log('Summary boolean', summary);

          if (summary) {
            summaryProducts = await MonsantoRetailerOrderSummaryProduct.all({
              where: { summaryId: summary.id },
              include: [
                {
                  model: MonsantoProduct,
                  attributes: [
                    'id',
                    'brand',
                    'blend',
                    'treatment',
                    'classification',
                    'seedSize',
                    'packaging',
                    'seedCompanyId',
                    'crossReferenceId',
                    'productDetail',
                  ],
                  as: 'Product',
                  include: [
                    {
                      model: MonsantoProductLineItem,
                      attributes: [
                        'id',
                        'suggestedDealerPrice',
                        'suggestedDealerMeasurementUnitCode',
                        'suggestedDealerMeasurementValue',
                        'effectiveFrom',
                        'effectiveTo',
                      ],
                      as: 'LineItem',
                      // where: {
                      //   $and: [
                      //     {
                      //       effectiveFrom: {
                      //         $lte: new Date(),
                      //       },
                      //     },
                      //     {
                      //       effectiveTo: {
                      //         $gte: new Date(),
                      //       },
                      //     },
                      //   ],
                      // },
                    },
                  ],
                },
              ],
            });
            summaryProducts.forEach((summaryProduct) => {
              const {
                Product: product,
                totalRetailerProductQuantityValue,
                dealerBucket,
                allGrowerBucket,
                demand,
                supply,
              } = summaryProduct;
              const lineItem = product ? product.LineItem : {};
              const {
                id,
                brand,
                blend,
                treatment,
                classification,
                seedSize,
                packaging,
                seedCompanyId,
                crossReferenceId,
                productDetail,
              } = product || {};

              seedCompanyId === apiSeedCompany.id &&
                result.push({
                  id,
                  brand,
                  blend,
                  treatment,
                  classification,
                  seedSize,
                  packaging,
                  seedCompanyId,
                  crossReferenceId,
                  retailerOrderQty: totalRetailerProductQuantityValue,
                  msrp: lineItem ? lineItem.suggestedDealerPrice : 0,
                  dealerBucket,
                  allGrowerBucket,
                  demand,
                  supply,
                  productDetail,
                });
            });
          }
          return {
            ...apiSeedCompany.dataValues,
            summaryProducts: result,
          };
        }),
      );
      // console.log('returningApiSeedCompanies', returningApiSeedCompanies);
      res.json(filterDeletedListResponse(returningApiSeedCompanies));
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error listing apiSeedCompanies' });
    });
});

router.post('/', check('name').exists(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });
  const newApiSeedCompany = req.body;
  let { zoneIds } = newApiSeedCompany;
  zoneIds = zoneIds
    // .filter()
    .map((licence) => {
      return {
        classification: cropTypeMap[licence.classification.toLowerCase()] || licence.classification,
        zoneId: licence.zoneId,
      };
    });

  newApiSeedCompany.zoneIds = JSON.stringify(zoneIds);
  const organization = await Organization.findById(req.user.organizationId);
  let apiSeedCompany = new ApiSeedCompany(newApiSeedCompany);

  apiSeedCompany.organizationId = req.user.organizationId;

  apiSeedCompany
    .save()
    .then(async (newApiSeedCompany) => {
      // temp code here
      const latestZoneList = JSON.parse(newApiSeedCompany.zoneIds).map((item) => ({
        ...item,
        classification: mapObj[item.classification],
      }));
      const newCustomerData = {
        name: `Bayer Dealer Bucket`,
        organizationId: req.user.organizationId,
        monsantoTechnologyId: newApiSeedCompany.technologyId,
        glnId: newApiSeedCompany.glnId,
        organizationName: newApiSeedCompany.name,
        deliveryAddress: organization.dataValues.address,
        businessCity: organization.dataValues.businessCity,
        businessState: organization.dataValues.businessState,
        businessZip: organization.dataValues.businessZip,
        zoneIds: JSON.stringify(latestZoneList),
      };
      let customer = new Customer(newCustomerData);
      const savedCustomer = await customer.save();
      await PurchaseOrder.create({
        id: Math.floor(1000000 + Math.random() * 900000),
        customerId: savedCustomer.id,
        organizationId: req.user.organizationId,
        name: "Dealer's Bucket Default PO",
        dealerDiscountIds: [],
        isQuote: false,
        isSimple: true,
      });
      res.json(newApiSeedCompany);
    })
    .then(async () => {
      const apiseedcompanyData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });
      MonsantoProduct.findOne({
        where: {
          organizationId: req.user.organizationId,
          id: `99999${req.user.organizationId}`,
        },
      })
        .then((isExits) => {
          if (!isExits) {
            MonsantoProduct.create({
              organizationId: req.user.organizationId,
              id: `99999${req.user.organizationId}`,
              seedCompanyId: apiseedcompanyData.dataValues.id,
              isFavorite: false,
              productDetail: 'specialID',
              classification: 'no',
            });
          }
        })
        .then(async () => {
          const isExitsItems = await MonsantoProductLineItem.findOne({
            where: {
              organizationId: req.user.organizationId,
              productId: `99999${req.user.organizationId}`,
              id: `99999${req.user.organizationId}`,
            },
          });
          setTimeout(() => {
            if (!isExitsItems) {
              MonsantoProductLineItem.create({
                id: `99999${req.user.organizationId}`,

                organizationId: req.user.organizationId,
                productId: `99999${req.user.organizationId}`,
                lineNumber: `99999${req.user.organizationId}`,
                crossReferenceProductId: 'specialID',
                effectiveFrom: new Date(),
                effectiveTo: new Date(),
                suggestedDealerPrice: JSON.stringify({}),
                suggestedDealerCurrencyCode: JSON.stringify({}),
                suggestedDealerMeasurementValue: 0,
                suggestedDealerMeasurementUnitCode: JSON.stringify({}),
                suggestedEndUserPrice: JSON.stringify({}),
                suggestedEndUserCurrencyCode: JSON.stringify({}),
                suggestedEndUserMeasurementValue: 0,
                suggestedEndUserMeasurementUnitCode: JSON.stringify({}),
              });
            }
          }, 1000);
        })
        .then(() => {
          console.log("SpecialID's record create successfully");
        })
        .catch((e) => {
          console.log(e, 'error creating specialID record');
        });
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error creating apiSeedCompany' });
    });
});

router.patch('/:id', (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  ApiSeedCompany.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((apiSeedCompany) => apiSeedCompany.update(req.body))
    .then((apiSeedCompany) => res.json(apiSeedCompany))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error updating apiSeedCompany' });
    });
});

router.get('/last_update', (req, res) => {
  ApiSeedCompany.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"ApiSeedCompany"."updatedAt" DESC'),
    limit: 1,
  })
    .then((apiSeedCompanies) => {
      let lastUpdate = (apiSeedCompanies[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => res.status(422).json({ errors: 'Error getting last update' }));
});

router.delete('/:id', (req, res) => {
  let apiSeedCompany;
  ApiSeedCompany.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then(async (response) => {
      apiSeedCompany = response;
      return apiSeedCompany.update({ isDeleted: true });
    })
    .then((data) => {
      return apiSeedCompany.softDestroy(apiSeedCompany.id);
    })
    .then(() => res.json(apiSeedCompany))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ errors: 'Error deleting apiSeedCompany ' });
    });
});

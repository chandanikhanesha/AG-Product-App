const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');
const json2csv = require('json2csv').parse;
const request = require('request-promise');
const config = require('config').getConfig();
const accessControlMiddleware = require('../middleware/accessControlCheck');
const authMiddleware = require('../middleware/userAuth');
const getMonsantoId = require('middleware/getMonsantoId');
const { create: actionLogCreator } = require('../middleware/actionLogCreator');
const { create: monsantoReqLogCreator } = require('../middleware/monsantoReqLogCreator');
const { parseProductBookingError, calculateSeedYear } = require('../utilities/xml/common');
const { create: transferLog } = require('../middleware/transferLog');

const {
  Customer,
  CustomerProduct,
  CustomerCustomProduct,
  CustomerMonsantoProduct,
  PurchaseOrder,
  Payment,
  Product,
  CustomProduct,
  MonsantoProduct,
  DeliveryReceipt,
  DeliveryReceiptDetails,
  Organization,
  Statement,
  ApiSeedCompany,
  ProductPackaging,
  Note,
  MonsantoProductLineItem,
  Farm,
  Shareholder,
  Company,
  SeedCompany,
  ...db
} = require('models');
const customerProductsController = require('./CustomerProductsController');
const customerCustomProductsController = require('./CustomerCustomProductsController');
const customerMonsantoProductsController = require('./CustomerMonsantoProductsController');
const shareholdersController = require('./ShareholdersController');
const farmsController = require('./FarmsController');
const { sanitizeZones, checkAndSyncPriceSheets } = require('./MonsantoSyncController');
const { syncRetailerOrderSummary } = require('./MonsantoRetailOrdersController');
const {
  productBooking: { buildProductBookingRequest, parseProductBookingResponse },
  common: { parseXmlStringPromise },
} = require('utilities/xml');

const router = (module.exports = Router()
  .use(authMiddleware)
  .use('/:customer_id/products', customerProductsController)
  .use('/:customer_id/monsanto_products', customerMonsantoProductsController)
  .use('/:customer_id/custom_products', customerCustomProductsController)
  .use('/:customer_id/shareholders', shareholdersController)
  .use('/:customer_id/farms', farmsController));

const cropMap = {
  CORN: 'C',
  SOYBEAN: 'B',
  SORGHUM: 'S',
  // ALFALFA: 'A',
  CANOLA: 'L',
  PACKAGING: 'P',
};
const mapObj = {
  C: 'CORN',
  B: 'SOYBEAN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
  P: 'PACKAGING',
};

const noDeletedWhere = {
  $or: [
    {
      isDeleted: false,
    },
    {
      isDeleted: null,
    },
  ],
};

const getPagination = (page, size) => {
  const limit = size ? +size : 1;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: customers } = data;
  const currentPage = page ? +page : 0;
  const customersdata = customers.map((customer) => {
    let customerTotalPaid = 0;
    let customerTotalPayment = 0;
    let customerTotalDelivery = 0;
    let customerTotalDelivered = 0;
    let isSynce = [];
    let isDelivery = false;

    let AllBayerOrderQunaity = 0;
    let allLotsDelivered = 0;
    let AllNonBayerproductQunatity = 0;
    const oldDeliveryReceipt = [];

    customer.PurchaseOrders.forEach((purchaseOrder) => {
      //bayer Deliveries GPOS sync Status
      purchaseOrder.DeliveryReceipts.length > 0 &&
        purchaseOrder.DeliveryReceipts.filter((d) => d.isSynce === false).map((d) => isSynce.push(d));

      if (purchaseOrder.DeliveryReceipts.length <= 0) {
        isDelivery = true;
      }

      //Bayerproduct Delivery status
      purchaseOrder.DeliveryReceipts.forEach((dd) =>
        dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)),
      );
      allLotsDelivered =
        oldDeliveryReceipt &&
        oldDeliveryReceipt
          .map((d) => parseFloat(d.amountDelivered || 0) || 0)
          .reduce((partialSum, a) => partialSum + a, 0);
      purchaseOrder.CustomerMonsantoProducts.map(
        (cmp) => (AllBayerOrderQunaity += cmp.monsantoOrderQty !== null ? parseFloat(cmp.monsantoOrderQty) : 0),
      );

      //nonBayerproduct Delivery Status

      purchaseOrder.CustomerCustomProducts.map((ccp) => (AllNonBayerproductQunatity += parseFloat(ccp.orderQty)));
      purchaseOrder.CustomerProducts.map((cp) => (AllNonBayerproductQunatity += parseFloat(cp.orderQty)));

      //totalPayment and totalDelivery
      let purchaseOrderTotalPayment = 0;
      let purchaseOrderTotalDelivery = 0;
      purchaseOrder.CustomerProducts.forEach((customerProduct) => {
        purchaseOrderTotalPayment +=
          customerProduct.orderQty *
          (customerProduct.msrpEdited
            ? parseFloat(customerProduct.msrpEdited)
            : customerProduct.Product
            ? customerProduct.Product.msrp
            : 0);
        purchaseOrderTotalDelivery += customerProduct.orderQty;
      });
      customerTotalDelivered += purchaseOrder.DeliveryReceipts.reduce(
        (totalSum, receipt) =>
          totalSum + receipt.DeliveryReceiptDetails.reduce((itemSum, detail) => itemSum + detail.amountDelivered, 0),
        0,
      );
      customerTotalPaid += purchaseOrder.Payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      customerTotalPayment += purchaseOrderTotalPayment;
      customerTotalDelivery += purchaseOrderTotalDelivery;
    });
    // customer.PurchaseOrders = customer.PurchaseOrders.filter(
    //   po => po.CustomerProducts.length > 0
    // );
    // customer.dataValues.PurchaseOrders = customer.dataValues.PurchaseOrders.filter(
    //   po => po.CustomerProducts.length > 0
    // );
    return {
      ...customer.toJSON(),
      customerTotalPayment,
      customerTotalPaid,
      customerTotalDelivery,
      customerTotalDelivered,
      isSynce:
        isDelivery || customer.PurchaseOrders.length == 0
          ? 'No deliveries'
          : isSynce.length > 0
          ? 'UnSynced'
          : 'Synced',
      bayerDeliveryStatus: AllBayerOrderQunaity <= allLotsDelivered,
      nonBayerDeliveryStatus: AllNonBayerproductQunatity <= allLotsDelivered,
    };
  });

  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, customersdata, totalPages, currentPage };
};
router.get('/', async (req, res, next) => {
  const page = req.query.page ? parseInt(req.query.page) : 0;
  const size = req.query.size ? parseInt(req.query.size) : 50;
  // console.log(req.query.filter, '-----------');

  try {
    const organization = await Organization.findOne({
      where: {
        id: req.user.organizationId,
      },
    });
    const { defaultSeason } = organization;
    const defaultSeasonWhere = {
      $or: [
        {
          seasonId: null,
        },
        {
          seasonId: defaultSeason,
        },
      ],
    };
    let attributes;
    let csvData = [];

    if (req.query.toCSV) {
      attributes = [
        'name',
        'email',
        'officePhoneNumber',
        'deliveryAddress',
        'deliveryAddress',
        'businessStreet',
        'monsantoTechnologyId',
        'notes',
        'businessCity',
        'businessState',
        'businessZip',
        'cellPhoneNumber',
        //"zoneIds",
      ];
    }

    const { limit, offset } = getPagination(page, size);
    let customers = await Customer.findAndCountAll({
      where: {
        organizationId: req.user.organizationId,
        // isArchive: false,
        ...(req.query.searchName
          ? {
              name: {
                [db.Sequelize.Op.iLike]: `%${req.query.searchName.toLowerCase()}%`,
              },
            }
          : {}),
        ...noDeletedWhere,
      },
      include: [
        {
          model: PurchaseOrder,
          where: noDeletedWhere,
          separate: true,
          include: [
            {
              model: Payment,
            },

            {
              model: CustomerProduct,
              separate: true,
              include: [
                {
                  model: Product,
                  // where: defaultSeasonWhere,
                  include: [
                    {
                      model: SeedCompany,
                      as: 'SeedCompany',
                    },
                    {
                      model: ProductPackaging,
                      include: [{ model: PurchaseOrder, where: { id: req.params.id } }],
                    },
                  ],
                },
              ],
            },

            {
              model: CustomerCustomProduct,
              // where: noDeletedWhere,
              separate: true,

              include: [
                {
                  model: CustomProduct,
                  include: [
                    {
                      model: Company,
                      as: 'Company',
                    },
                  ],
                },
              ],
            },
            {
              model: CustomerMonsantoProduct,
              // where: noDeletedWhere,
              separate: true,

              include: [
                {
                  model: MonsantoProduct,
                  include: [
                    {
                      model: ApiSeedCompany,
                      as: 'ApiSeedCompany',
                    },
                  ],
                },
              ],
            },
            {
              model: DeliveryReceipt,
              // where: noDeletedWhere,

              include: [
                {
                  model: DeliveryReceiptDetails,
                  // where: noDeletedWhere,

                  attributes: [
                    'id',
                    'amountDelivered',
                    'deliveryReceiptId',
                    'lotId',
                    'createdAt',
                    'customProductId',
                    'isDeleted',
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Statement,
          where: noDeletedWhere,
          separate: true,
        },

        { model: Farm, separate: true },
        { model: Shareholder, separate: true },

        {
          model: Note,
          where: noDeletedWhere,
          separate: true,
        },
      ],
      limit,
      offset,
      attributes,
      order: [['name', 'ASC']],
    });

    if (req.query.toCSV) {
      console.log('helllo cdv one');
      let customers = await Customer.all({
        where: {
          organizationId: req.user.organizationId,
          ...(req.query.searchName
            ? {
                name: {
                  [db.Sequelize.Op.iLike]: `%${req.query.searchName.toLowerCase()}%`,
                },
              }
            : {}),
          ...noDeletedWhere,
        },
      });
      csvData = customers.map((customer) => {
        let customerData = { ...customer.toJSON() };

        return {
          name: customerData.name,
          email: customerData.email,
          officePhoneNumber: customerData.officePhoneNumber,
          cellPhoneNumber: customerData.cellPhoneNumber,
          deliveryAddress: customerData.deliveryAddress,
          businessStreet: customerData.businessStreet,
          businessCity: customerData.businessCity,
          businessState: customerData.businessState,
          businessZip: customerData.businessZip,
          notes: customerData.notes,
          monsantoTechnologyId: customerData.monsantoTechnologyId,
        };
      });
    }
    //TODO: probably filter purchaseOrders with Products empty

    if (req.query.toCSV) {
      console.log('helllo csv two');

      const csvString = json2csv(csvData);
      //console.log(data)
      res.setHeader('Content-disposition', 'attachment; filename=customers.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csvString);
    } else {
      let response = getPagingData(customers, page, limit, req.query.filter);

      if (req.query.filter === 'notSyncedBayerDeliveryReceipt') {
        response = {
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          totalItems: response.totalItems,
          customersdata: response.customersdata.filter((d) => d.isSynce === 'UnSynced'),
        };

        res.json(response);
      } else if (req.query.filter === 'unDeliveredBayerProducts') {
        response = {
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          totalItems: response.totalItems,
          customersdata: response.customersdata.filter((d) => d.bayerDeliveryStatus === false),
        };

        res.json(response);
      } else if (req.query.filter === 'unDeliveredNonBayerProducts') {
        response = {
          totalPages: response.totalPages,
          currentPage: response.currentPage,
          totalItems: response.totalItems,
          customersdata: response.customersdata.filter((d) => d.nonBayerDeliveryStatus === false),
        };

        res.json(response);
      } else {
        res.json(response);
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ errors: err.message });
  }
});
router.get('/last_update', (req, res, next) => {
  Customer.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"Customer"."updatedAt" DESC'),
    limit: 1,
  })
    .then((purchaseOrders) => {
      let lastUpdate = (purchaseOrders[0] || {}).updatedAt;

      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

router.post('/invoice-zip', async (req, res, next) => {
  try {
    res.send('ok');
  } catch (e) {
    console.log('err: ', e);
    return res.status(422).json({ e, error: 'Error creating invoice-zip' });
  }
});

router.post(
  '/',
  check('name').exists(),
  accessControlMiddleware.check('create', 'customer'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!Array.isArray(req.body) && !errors.isEmpty())
      return res.status(422).json({ errors: 'Not all parameters present' });
    let newCustomerData = req.body;
    if (!Array.isArray(newCustomerData)) {
      newCustomerData.monsantoTechnologyId = newCustomerData.monsantoTechnologyId.trim();
    } else {
      newCustomerData = newCustomerData.map((item) => {
        return {
          ...item,
          monsantoTechnologyId: item.monsantoTechnologyId && item.monsantoTechnologyId.trim(),
        };
      });
    }
    if (req.body.willUseSeedDealerZones) {
      try {
        const apiSeedCompany = await ApiSeedCompany.findOne({
          where: {
            organizationId: req.body.organizationId,
          },
          attributes: ['zoneIds'],
        });
        if (!apiSeedCompany) {
          return res.status(422).json({
            error:
              'Error creating customer: You must have an API seedCompany created in order to use zones for this customer',
          });
        }
        const mapedZoneIds = JSON.parse(apiSeedCompany.zoneIds).map((item) => ({
          classification: mapObj[item.classification],
          zoneId: item.zoneId,
        }));
        newCustomerData.zoneIds = JSON.stringify(mapedZoneIds);
      } catch (e) {
        console.log('ee1: ', e);
        return res.status(422).json({ error: 'Error creating customer' });
      }
    }

    try {
      let savedCustomer;
      if (Array.isArray(newCustomerData)) {
        let customerListPromises = [];
        for (let i = 0; i < newCustomerData.length; i++) {
          // customerListPromises.push(Customer.create(newCustomerData[i]));
          const abc = await Customer.create(newCustomerData[i]);
          customerListPromises.push(abc.dataValues);
        }
        res.json(customerListPromises);

        // Promise.all(customerListPromises)
        //   .then((data) => {
        //     savedCustomer = newCustomerData;
        //     res.json(savedCustomer);
        //   })
        //   .catch((err) => {
        //     console.log('ee2: ', e);
        //     return res.status(422).json({ error: 'Error creating customers' });
        //   });
      } else {
        let customer = new Customer(newCustomerData);
        savedCustomer = await customer.save();
        res.json(savedCustomer);
      }
    } catch (e) {
      console.log('ee3: ', e);
      return res.status(422).json({ error: 'Error creating customer' });
    }
  },
);

router.delete('/:id', accessControlMiddleware.check('delete', 'customer'), (req, res, next) => {
  let previousData;
  Customer.findById(req.params.id)
    .then((customer) => {
      previousData = customer.toJSON();
      customer.update({ isDeleted: true });
    })
    .then((updatedCustomer) => {
      actionLogCreator({
        req,
        operation: 'delete',
        type: 'customer',
        previousData,
        previousData: req.body,
        changedData: {},
        typeId: req.params.id,
      });
      res.json({ ok: 'ok' });
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error deleting customer' });
    });
});

router.patch('/:id', check('name').exists(), accessControlMiddleware.check('update', 'customer'), (req, res, next) => {
  let previousData;
  const errors = validationResult(req);
  // if (!errors.isEmpty())
  //   return res.status(422).json({ errors: "Not all parameters present" });
  Customer.findOne({
    where: { id: req.params.id },
    include: [
      {
        model: PurchaseOrder,
        where: noDeletedWhere,
        separate: true,
        include: [
          {
            model: Payment,
          },
          {
            model: CustomerProduct,
            // include: [{ model: Product, where: defaultSeasonWhere }],
            include: [
              {
                model: Product,
                include: [
                  {
                    model: ProductPackaging,
                  },
                ],
              },
            ],
          },
          {
            model: CustomerCustomProduct,
            // include: [{ model: Product, where: defaultSeasonWhere }],
            include: [{ model: CustomProduct }],
          },
          {
            model: CustomerMonsantoProduct,
            // include: [{ model: Product, where: defaultSeasonWhere }],
            include: [{ model: MonsantoProduct }],
          },
          {
            model: DeliveryReceipt,
            include: [
              {
                model: DeliveryReceiptDetails,
                attributes: [
                  'id',
                  'amountDelivered',
                  'deliveryReceiptId',
                  'lotId',
                  'createdAt',
                  'customProductId',
                  'isDeleted',
                ],
              },
            ],
          },
        ],
      },
      {
        model: Statement,
        where: noDeletedWhere,
        separate: true,
      },
      {
        model: Note,
        where: noDeletedWhere,
        separate: true,
      },
    ],
  })
    .then(async (customer) => {
      previousData = customer.toJSON();
      const apiSeedCompanies = await ApiSeedCompany.findOne({
        where: {
          organizationId: req.user.organizationId,
          isDeleted: false,
        },
      });
      // apiSeedCompanies.forEach(apiSeedCompany => {
      //   if (
      //     JSON.parse(apiSeedCompany.dataValues.zoneIds) === req.body.zoneIds
      //   ) {
      //     return;
      //   } else {
      //     const customerZoneIds = req.body.zoneIds;
      //     const apiSeedCompanyZoneIds = JSON.parse(
      //       apiSeedCompany.dataValues.zoneIds
      //     );
      //     if (customerZoneIds) {
      //       customerZoneIds.forEach(zoneId => {
      //         const filterResult = apiSeedCompanyZoneIds.filter(
      //           apiSeedCompanyZoneId =>
      //             apiSeedCompanyZoneId.classification ===
      //             zoneId.classification &&
      //             apiSeedCompanyZoneId.zoneId === zoneId.zoneId
      //         );
      //         if (filterResult.length > 0) {
      //           return;
      //         }
      //         const zones = sanitizeZones(apiSeedCompanyZoneIds);
      //         checkAndSyncPriceSheets({
      //           zones,
      //           seedCompanyId: apiSeedCompany.id,
      //           monsantoId: apiSeedCompany.technologyId,
      //           zoneIdHolder: apiSeedCompany,
      //           user: req.user
      //         });
      //         syncRetailerOrderSummary({
      //           user: req.user,
      //           seedDealerMonsantoId: apiSeedCompany.technologyId
      //         });
      //       });
      //     }
      //   }
      // });
      const newCustomerData = req.body;
      if (newCustomerData.notes && newCustomerData.notes !== '' && newCustomerData.notes !== customer.notes) {
        newCustomerData.addNotesDate = new Date();
      }

      const customerZonelist = req.body.zoneIds ? JSON.parse(req.body.zoneIds) : [];
      const dealerZonelist =
        apiSeedCompanies && apiSeedCompanies.dataValues.zoneIds ? JSON.parse(apiSeedCompanies.dataValues.zoneIds) : [];
      return Promise.all(
        dealerZonelist.map(async (dealerzone) => {
          customerZonelist.map(async (customerzone) => {
            if (dealerzone.classification === cropMap[customerzone.classification]) {
              if (Array.isArray(dealerzone.zoneId)) {
                console.log(dealerzone, dealerzone.zoneId);
                if (!dealerzone.zoneId.includes(customerzone.zoneId.toString())) {
                  const monsantoProducts = await MonsantoProduct.findAll({
                    where: {
                      classification: dealerzone.classification,
                      organizationId: req.user.organizationId,
                    },
                  });
                  monsantoProducts.map(async (item) => {
                    const monsantoProductLineItem = await MonsantoProductLineItem.findOne({
                      where: {
                        crossReferenceProductId: item.dataValues.crossReferenceId,
                        organizationId: req.user.organizationId,
                      },
                    });
                    const updatedDealerPrice = JSON.parse(monsantoProductLineItem.dataValues.suggestedDealerPrice);
                    const updatedCustomerPrice = JSON.parse(monsantoProductLineItem.dataValues.suggestedEndUserPrice);
                    updatedDealerPrice[customerzone.zoneId] = 0;
                    updatedCustomerPrice[customerzone.zoneId] = 0;
                    monsantoProductLineItem.update({
                      suggestedDealerPrice: JSON.stringify(updatedDealerPrice),
                      suggestedEndUserPrice: JSON.stringify(updatedCustomerPrice),
                    });
                  });
                }
              } else if (dealerzone.zoneId !== customerzone.zoneId) {
                const monsantoProducts = await MonsantoProduct.findAll({
                  where: {
                    classification: dealerzone.classification,
                    organizationId: req.user.organizationId,
                  },
                });
                monsantoProducts.map(async (item) => {
                  const monsantoProductLineItem = await MonsantoProductLineItem.findOne({
                    where: {
                      crossReferenceProductId: item.dataValues.crossReferenceId,
                      organizationId: req.user.organizationId,
                    },
                  });
                  const updatedDealerPrice = JSON.parse(monsantoProductLineItem.dataValues.suggestedDealerPrice);
                  const updatedCustomerPrice = JSON.parse(monsantoProductLineItem.dataValues.suggestedEndUserPrice);
                  updatedDealerPrice[customerzone.zoneId] = 0;
                  updatedCustomerPrice[customerzone.zoneId] = 0;
                  monsantoProductLineItem.update({
                    suggestedDealerPrice: JSON.stringify(updatedDealerPrice),
                    suggestedEndUserPrice: JSON.stringify(updatedCustomerPrice),
                  });
                });
              }
            }
          });
        }),
      )
        .then(async () => {
          if (req.body.willUseSeedDealerZones) {
            try {
              const apiSeedCompany = await ApiSeedCompany.findOne({
                where: {
                  organizationId: req.user.organizationId,
                },
                attributes: ['zoneIds'],
              });
              // if (!apiSeedCompany) {
              //   return res.status(422).json({
              //     error:
              //       'Error creating customer: You must have an API seedCompany created in order to use zones for this customer',
              //   });
              // }
              const mapedZoneIds = JSON.parse(apiSeedCompany.zoneIds).map((item) => ({
                classification: mapObj[item.classification],
                zoneId: item.zoneId,
              }));
              newCustomerData.zoneIds = JSON.stringify(mapedZoneIds);
            } catch (e) {
              console.log('ee1: ', e);
              // return res.status(422).json({ error: 'Error creating customer' });
            }
          }

          return customer.update(newCustomerData);
        })
        .catch((err) => {
          console.log(`Something went wrong!`);
          throw new Error('Something went wrong while updating pricesheet with new zone!');
        });
    })
    .then((updatedCustomer) => {
      actionLogCreator({
        req,
        operation: 'update',
        type: 'customer',
        previousData,
        changedData: req.body,
        typeId: req.params.id,
      });

      return res.json({ customer: updatedCustomer });
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error updating customer' });
    });
});

router.post(
  '/:customer_id/purchase_orders',
  check('isQuote').exists(),
  accessControlMiddleware.check('create', 'purchaseOrder'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

    let customerId = req.params.customer_id;
    let isQuote = req.body.isQuote || false;
    let isSimple = req.body.isSimple || false;
    let name = req.body.name;
    if (!name) {
      name = isQuote ? '' : '';
    }
    const organizationId = req.user.organizationId;
    PurchaseOrder.create({
      id: Math.floor(1000000 + Math.random() * 900000),
      customerId: customerId,
      organizationId,
      name,
      dealerDiscountIds: [],
      isQuote,
      isSimple,
      farmData: req.body.farmData ? req.body.farmData : [],
      shareholderData: req.body.shareholderData ? req.body.shareholderData : [],
    })
      .then((purchaseOrder) => {
        actionLogCreator({
          req,
          operation: 'create',
          type: purchaseOrder.isQuote ? 'Quote' : 'Purchase Order',
          previousData: {},
          changedData: req.body,
          typeId: purchaseOrder.id,
        });
        return res.json(purchaseOrder);
      })
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ errors: 'Error creating purchase order' });
      });
  },
);

router.patch(
  '/:customer_id/purchase_orders/:id/convert',
  check('to').exists(),
  accessControlMiddleware.check('update', 'purchaseOrder'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

    let purchaseOrder;
    let previousData;

    const fromProducts = await CustomerMonsantoProduct.findAll({
      where: { purchaseOrderId: req.params.id },
    });
    let currentOrders = await CustomerMonsantoProduct.findAll({
      where: {
        purchaseOrderId: req.body.to,
      },
      attributes: ['lineItemNumber'],
      group: ['purchaseOrderId', 'lineItemNumber'],
      order: [['lineItemNumber', 'DESC']],
      limit: 1,
    });
    if (!currentOrders || !currentOrders.length) {
      lineItemNumber = '1';
    } else {
      lineItemNumber = parseInt(currentOrders[0].lineItemNumber) + 1;
    }
    Promise.all(
      fromProducts.map(async (product) => {
        console.log('lineItemNumber1', lineItemNumber);
        const checkExistance = await CustomerMonsantoProduct.findAll({
          where: {
            purchaseOrderId: req.body.to,
            monsantoProductId: product.dataValues.monsantoProductId,
            isDeleted: false,
          },
        });

        if (checkExistance.length > 0) {
          CustomerMonsantoProduct.findAll({
            where: { id: checkExistance[0].dataValues.id },
          }).then(function (monsantoProduct) {
            // Check if record exists in db
            const orderQty =
              parseFloat(monsantoProduct[0].dataValues.orderQty) + parseFloat(product.dataValues.orderQty);
            if (monsantoProduct) {
              monsantoProduct[0]
                .update({ orderQty: orderQty, isSent: false })
                .then(() => {
                  console.log('updated');
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          });
        } else {
          CustomerMonsantoProduct.update(
            {
              purchaseOrderId: req.body.to,
              lineItemNumber: lineItemNumber,
              isSent: false,
            },
            { where: { purchaseOrderId: req.params.id, id: product.dataValues.id } },
          )
            .then((customerProduct) => console.log('created'))
            .catch((e) => {
              console.log(e);
            });
        }
        lineItemNumber = parseInt(lineItemNumber) + 1;
      }),
    );

    db.sequelize
      .transaction((transaction) => {
        return PurchaseOrder.findById(req.params.id, { transaction })
          .then((po) => {
            previousData = po.toJSON();
            purchaseOrder = po;
            return CustomerProduct.update(
              { purchaseOrderId: req.body.to },
              { where: { purchaseOrderId: req.params.id } },
              { transaction },
            );
          })
          .then(() =>
            CustomerCustomProduct.update(
              { purchaseOrderId: req.body.to },
              { where: { purchaseOrderId: req.params.id } },
              { transaction },
            ),
          )
          .then(() => purchaseOrder.update({ isDeleted: true }))
          .then(() => {
            purchaseOrder.softDestroy();
          });
      })
      .then(() => {
        actionLogCreator({
          req,
          operation: 'convert',
          type: 'Quote',
          previousData,
          changedData: req.body,
          typeId: req.params.id,
        });

        transferLog({
          req,
          productName: null,
          action: {
            convertRow: 'convert quote to PurchaseOrders',
          },
          otherDetail: {
            TransferStatus: `It's Transfer Succesfull`,
          },
          purchaseOrderId: req.body.to,
          productId: null,
          rowId: req.params.id,
        });

        return res.json({ ok: 'ok' });
      })
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ errors: 'Error converting quote' });
        transferLog({
          req,
          productName: null,
          action: {
            convertRow: 'convert quote to PurchaseOrders',
          },
          otherDetail: {
            TransferStatus: `It's Transfer UnSuccesfull`,
            Error: 'Error converting quote',
          },
          purchaseOrderId: req.body.to,
          productId: null,
          rowId: req.params.id,
        });
      });
  },
);

router.patch(
  '/:customer_id/purchase_orders/:id',
  accessControlMiddleware.check('update', 'purchaseOrder'),
  (req, res, next) => {
    console.log('updating');
    let previousData;
    PurchaseOrder.findById(req.params.id)
      .then((purchaseOrder) => {
        previousData = purchaseOrder.toJSON();
        const newPoData = req.body;
        //console.log('newPoData before', newPoData);
        if (newPoData.notes && newPoData.notes !== '' && newPoData.notes !== purchaseOrder.notes) {
          newPoData.addNotesDate = new Date();
        }
        //console.log('newPoData after', newPoData);
        if (newPoData.isReplant) {
          CustomerProduct.update(
            {
              isReplant: newPoData.isReplant,
            },

            {
              where: {
                purchaseOrderId: req.params.id,
                organizationId: req.user.organizationId,
                isDeleted: false,
              },
            },
          );
          CustomerCustomProduct.update(
            {
              isReplant: newPoData.isReplant,
            },

            {
              where: {
                purchaseOrderId: req.params.id,
                organizationId: req.user.organizationId,
                isDeleted: false,
              },
            },
          );
          CustomerMonsantoProduct.update(
            {
              isReplant: newPoData.isReplant,
            },

            {
              where: {
                purchaseOrderId: req.params.id,
                organizationId: req.user.organizationId,
                isDeleted: false,
              },
            },
          );
        }

        return purchaseOrder.update(newPoData);
      })
      .then((purchaseOrder) => purchaseOrder.updateEarlyPays(req.body.modifiedEarlyPayRows, req.user.organizationId))
      .then((purchaseOrder) =>
        PurchaseOrder.findById(purchaseOrder.id, {
          include: ['CustomEarlyPays'],
        }),
      )
      .then((purchaseOrder) => {
        actionLogCreator({
          req,
          operation: 'update',
          type: previousData.isQuote ? 'Quote' : 'Purchase Order',
          typeId: req.params.id,
          previousData,
          changedData: req.body,
        });
        res.json(purchaseOrder);
      })
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ errors: 'Error updating purchase order' });
      });
  },
);

router.delete(
  '/:customer_id/purchase_orders/:id',
  [accessControlMiddleware.check('delete', 'purchaseOrder'), getMonsantoId],
  async (req, res) => {
    // const { seedDealerMonsantoId, seedCompanyId, organizationName } = req.body;
    const { seedCompanyId, organizationName } = req.body;
    console.log(req.params.customer_id, 'customer_ID');
    const apiSeedCompany = await ApiSeedCompany.findOne({
      where: {
        organizationId: req.user.organizationId,
        isDeleted: false,
      },
    });
    let seedDealerMonsantoId = apiSeedCompany.dataValues.technologyId;

    let previousData;
    let msg = '';
    const customer = await Customer.findOne({
      where: {
        id: req.params.customer_id,
        organizationId: req.user.organizationId,
        isArchive: false,
      },
    });

    const monsantoUserData = await ApiSeedCompany.findOne({
      where: { organizationId: req.user.organizationId },
    });

    const organization = await Organization.findById(req.user.organizationId);
    const organizationAddress = organization.dataValues.address;
    const organizationBusinessCity = organization.dataValues.businessCity;
    const organizationBusinessState = organization.dataValues.businessState;
    const organizationBusinessZip = organization.dataValues.businessZip;
    let x = new Date().toISOString().split('Z');
    let x1 = x[0].split('.');
    let x2 = x1[0] + '-05:00';

    CustomerMonsantoProduct.all({
      where: {
        organizationId: req.user.organizationId,
        purchaseOrderId: req.params.id,
        isSent: true,
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
    })
      .then(async (customerProduct) => {
        if (customerProduct.length) {
          const getProducts = () => {
            return customerProduct
              .filter((order) => order.orderQty > 0 && order.isDeleted == false)
              .map((order) => {
                return {
                  lineNumber: order.dataValues.lineNumber || '999999',
                  lineItemNumber: order.dataValues.lineItemNumber,
                  action: 'Delete',
                  requestedDate: customer.dataValues.requestedDate || x2,
                  crossReferenceProductId: order.dataValues.MonsantoProduct.crossReferenceId,
                  increaseOrDecrease: {
                    type: 'Decrease',
                    unit: order.dataValues.unit,
                    value: order.dataValues.orderQty,
                  },
                  quantity: {
                    value: 0,
                    unit: order.dataValues.unit,
                  },
                  orderQty: order.dataValues.orderQty,
                  monsantoOrderQty: order.dataValues.monsantoOrderQty,
                  requestedShipDate: new Date(+new Date() + 60 * 60 * 24 * 7).toISOString(), // ASK sourabh
                  isDeleted: order.dataValues.isDeleted,
                  lineItem: order.dataValues.MonsantoProduct.LineItem,
                };
              });
          };
          const monsantoRequest = {
            orders: [
              {
                orderType: 'Cancelled',
                orderNumber: req.params.id,
                productYear: calculateSeedYear(),
                directShip: 0,
                issuedDate: x2,
                orderReference: customerProduct[0].dataValues.PurchaseOrder.dataValues.salesOrderReference,
                shipTo: {
                  name: customer.dataValues.organizationName || customer.dataValues.name,
                  identifier: customer.dataValues.glnId
                    ? customer.dataValues.glnId
                    : customer.dataValues.monsantoTechnologyId,
                  agency:
                    customer.dataValues.name == 'Bayer Dealer Bucket'
                      ? 'GLN'
                      : customer.dataValues.glnId !== null
                      ? 'GLN'
                      : 'AssignedBySeller',
                  addressInformation: {
                    city: customer.dataValues.businessCity || '',
                    state: customer.dataValues.businessState || 'NE',
                    postalCode: customer.dataValues.businessZip || '10000',
                    postalCountry: 'US',
                    address: customer.dataValues.deliveryAddress || '',
                  },
                },
                products: getProducts(),
                seedCompanyId,
              },
            ],
            organizationName,
            organizationAddress,
            organizationBusinessCity,
            organizationBusinessState,
            organizationBusinessZip,
            seedDealerMonsantoId,
            res,
            isDealerBucket: customer.dataValues.name.includes('Bayer Dealer Bucket') ? true : false,
            monsantoUserData,
          };
          const xmlStringRequest = await makeProductBookingRequest(monsantoRequest);
          const response = await request.post(config.monsantoEndPoint, {
            'content-type': 'text/plain',
            body: xmlStringRequest,
          });
          const responseString = await parseXmlStringPromise(response);
          const monsantoResponse = await parseProductBookingResponse(responseString);
          const {
            properties: { crossRefIdentifier, responseStatus },
            details,
          } = monsantoResponse;
          monsantoReqLogCreator({
            req,
            userName: customer.dataValues.name + '(' + customer.dataValues.id + ')',
            type: 'product booking delete',
            uuid: monsantoResponse.uuid,
            description: JSON.stringify(responseStatus),
          });

          const { errorMsg, warningMsg, isError } = parseProductBookingError(responseStatus, details);
          if (isError) throw new Error(errorMsg); // generates an exception
          if (warningMsg) msg = warningMsg;
        }
        PurchaseOrder.findOne({
          where: {
            id: req.params.id,
            organizationId: req.user.organizationId,
          },
        })
          .then((purchaseOrder) => {
            previousData = purchaseOrder.toJSON();
            purchaseOrder
              .update({ isDeleted: true })
              .then(async () => {
                CustomerMonsantoProduct.update(
                  { isDeleted: true },
                  {
                    where: {
                      purchaseOrderId: req.params.id,
                      isDeleted: false,
                    },
                  },
                ).then(async (CustomerMonsantoProduct) => {
                  const monsantoProduct = await MonsantoProduct.findById(
                    CustomerMonsantoProduct.dataValues.monsantoProductId,
                  );

                  transferLog({
                    req,
                    productName: monsantoProduct.dataValues.productDetail,
                    action: { DeletedRow: 'done' },
                    otherDetail: {},
                    purchaseOrderId: req.params.id,
                    productId: CustomerMonsantoProduct.dataValues.monsantoProductId,
                    rowId: CustomerMonsantoProduct.dataValues.id,
                  });
                });
              })
              .then(() => {
                CustomerCustomProduct.update(
                  { isDeleted: true },
                  { where: { purchaseOrderId: req.params.id, isDeleted: false } },
                );
              })
              .then(() => {
                CustomerProduct.update(
                  { isDeleted: true },
                  { where: { purchaseOrderId: req.params.id, isDeleted: false } },
                );
              });
          })
          // .then(purchaseOrder => purchaseOrder.softDestroy())
          .then((purchaseOrder) => {
            actionLogCreator({
              req,
              operation: 'delete',
              type: previousData.isQuote ? 'Quote' : 'Purchase Order',
              typeId: req.params.id,
              previousData: req.body,
              changedData: {},
            });
            return res.json(purchaseOrder);
          })
          .catch((e) => {
            console.log('error : ', e);
            res.status(422).json({ errors: e });
          });
      })
      .then(() => res.json({ ok: msg }))
      .catch((e) => {
        console.log('error...: ', e);
        res.status(422).json({ error: e });
      });
  },
);

async function makeProductBookingRequest({
  orders,
  organizationName,
  organizationAddress,
  organizationBusinessCity,
  organizationBusinessState,
  organizationBusinessZip,
  seedDealerMonsantoId,
  res,
  isDealerBucket,
  monsantoUserData,
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
    // console.log("<>><>>: ", e);
    return res.status(503).json({ error: 'Something happened when processing your request' });
  }
}

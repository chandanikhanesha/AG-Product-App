const { Router } = require('express');
const Sequelize = require('sequelize');
const request = require('request-promise');

const authMiddleware = require('middleware/userAuth');

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
  TransferLog,
  bacakupData,
  DealerDiscount,
  ...db
} = require('models');
const {
  Farm,
  MonsantoFavoriteProduct,
  CustomLot,
  Lot,
  MonsantoLot,
  Backup,

  Report,

  StatementSetting,
} = require('../models');
const router = (module.exports = Router().use(authMiddleware));
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
// const cropMap = {
//   CORN: 'C',
//   SOYBEAN: 'B',
//   SORGHUM: 'S',
//   // ALFALFA: 'A',
//   CANOLA: 'L',
// };
// const mapObj = {
//   C: 'CORN',
//   B: 'SOYBEAN',
//   S: 'SORGHUM',
//   // A: 'ALFALFA',
//   L: 'CANOLA',
// };

router.get('/transferLog', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };

  TransferLog.all(query)
    .then((actionLogs) => res.json(actionLogs))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching transfer logs' });
    });
});

router.get('/backup_discount', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };

  DealerDiscount.all(query)
    .then((dealerDiscounts) => res.json(dealerDiscounts))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching dealer discounts' });
    });
});

router.get('/backup_discount/last_update', (req, res) => {
  DealerDiscount.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"DealerDiscount"."updatedAt" DESC'),
    limit: 1,
  })
    .then((dealerDiscounts) => {
      let lastUpdate = (dealerDiscounts[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

router.get('/backup_customer', async (req, res, next) => {
  try {
    const organization = await Organization.findOne({
      where: {
        id: req.user.organizationId,
      },
    });
    const { defaultSeason } = organization;
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
      },
      include: [
        {
          model: PurchaseOrder,
          separate: true,
          where: noDeletedWhere,

          include: [
            {
              model: CustomerProduct,
              // include: [{ model: Product, where: defaultSeasonWhere }],
              include: [
                {
                  model: Product,
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
          ],
        },
      ],
      attributes,
    });

    if (req.query.toCSV) {
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
    const data = customers.map((customer) => {
      customer.PurchaseOrders.forEach((purchaseOrder) => {
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
      });
      // customer.PurchaseOrders = customer.PurchaseOrders.filter(
      //   po => po.CustomerProducts.length > 0
      // );
      // customer.dataValues.PurchaseOrders = customer.dataValues.PurchaseOrders.filter(
      //   po => po.CustomerProducts.length > 0
      // );
      return {
        ...customer.toJSON(),
      };
    });
    if (req.query.toCSV) {
      const csvString = json2csv(csvData);
      //console.log(data)
      res.setHeader('Content-disposition', 'attachment; filename=customers.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csvString);
    } else {
      res.json(data);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ errors: err.message });
  }
});

router.get('/backup_customer/last_update', (req, res, next) => {
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

router.delete('/deleteAll', (req, res) => {
  console.log('hellllo');
  try {
    DeliveryReceiptDetails.destroy({
      where: {},
      force: true,
    })

      .then(() =>
        DeliveryReceipt.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        CustomLot.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        Lot.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        MonsantoLot.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        CustomerCustomProduct.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        CustomerMonsantoProduct.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        CustomerProduct.destroy({
          where: {},
          force: false,
        }),
      )
      .then(() =>
        MonsantoProductLineItem.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        MonsantoProduct.destroy({
          where: {},
          force: true,
        }),
      )

      .then(() =>
        MonsantoFavoriteProduct.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        Farm.destroy({
          where: {},
          force: true,
        }),
      )

      .then(() =>
        Report.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        Statement.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        StatementSetting.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        Payment.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        ProductPackaging.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        Note.destroy({
          where: {},
          force: true,
        }),
      )
      .then(() =>
        PurchaseOrder.destroy({
          where: {},
          force: false,
        }),
      )
      .then(() => res.send('Delete Table Data Succesfully'))
      .catch((e) => {
        console.log(e, 'error');
        res.status(500).json({ error: e });
      });
  } catch (e) {
    console.log(e);
  }
});

router.get('/backup_customer_history', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };

  Backup.all(query)
    .then((backup) => res.json(backup))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching backup customer History' });
    });
});

router.get('/backup_customer_history/last_update', (req, res) => {
  Backup.all({
    where: {
      organizationId: req.user.organizationId,
    },
    order: Sequelize.literal('"Backup"."updatedAt" DESC'),
    limit: 1,
  })
    .then((backup) => {
      let lastUpdate = (backup[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

// router.get('/downloadPdf/:id/:pId', async (req, res) => {
//   const bacakupData = await Backup.findOne({
//     where: { id: parseInt(req.params.id), purchaseOrderId: parseInt(req.params.pId) },
//     raw: true,
//   });
//   if (bacakupData) {
//     const filename = bacakupData.isDelivery == true ? `Delivery#${req.params.pId}` : `PO#${req.params.pId}`;

//     try {
//       req
//         .pipe(request(bacakupData.pdfLink))

//         .pipe(res);

//       // res.setHeader('Content-disposition', `attachment; filename=${filename}.pdf`);
//     } catch (e) {
//       console.log(e, 'e');
//     }
//   }
// });

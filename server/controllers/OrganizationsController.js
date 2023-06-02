const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { create: transferLog } = require('../middleware/transferLog');
const authMiddleware = require('middleware/userAuth');
const {
  Organization,
  Subscriptions,
  PurchaseOrder,
  ApiSeedCompany,
  Company,
  SeedCompany,
  Customer,
  DealerDiscount,
  SuperAdminSetting,
} = require('models');

const { organizationLogoUpload, removeUpload } = require('utilities/uploads');

const organizationAuthMiddleware = (req, res, next) => {
  if (req.user.isAdmin === true || req.user.organizationId.toString() === req.params.id.toString()) {
    return next();
  }

  return res.status(403).json({ error: 'Not authorized' });
};

const router = (module.exports = Router().use(authMiddleware));

router.get('/listAll', organizationAuthMiddleware, (req, res) => {
  Organization.findAll({})
    .then((organization) => res.json({ data: organization }))
    .catch((e) => {
      return res.status(422).json({ errors: 'Error updating days to due date' });
    });
});

router.get('/superAdminData', (req, res) => {
  Organization.findAll()
    .then(async (organization) => {
      const org = [];
      await Promise.all(
        organization.map(async (o) => {
          const apiSeedCompanies = await ApiSeedCompany.findAndCountAll({ where: { organizationId: o.id } });
          const companies = await Company.findAndCountAll({ where: { organizationId: o.id } });
          const seedCompanies = await SeedCompany.findAndCountAll({ where: { organizationId: o.id } });
          const customers = await Customer.findAndCountAll({ where: { organizationId: o.id, isArchive: false } });
          const purchaseOrders = await PurchaseOrder.findAndCountAll({
            where: { organizationId: o.id, isQuote: false },
          });
          const quotes = await PurchaseOrder.findAndCountAll({ where: { organizationId: o.id, isQuote: true } });
          const discounts = await DealerDiscount.findAndCountAll({ where: { organizationId: o.id } });
          // const subscription = await Subscriptions.findAll({ where: { organizationId: o.id } });
          org.push({
            ...o.dataValues,
            apiSeedCompanies: apiSeedCompanies.count > 0 ? 'True' : 'False',
            companies: companies.count,
            seedCompanies: seedCompanies.count,
            customers: customers.count,
            purchaseOrders: purchaseOrders.count,
            quotes: quotes.count,
            discounts: discounts.count,
            subscription: [],
          });
        }),
      );

      res.json({ data: org });
    })
    .catch((e) => {
      console.log(e, 'e');
      return res.status(422).json({ errors: 'Error updating days to due date' });
    });
});

router.get('/message-list', (req, res) => {
  SuperAdminSetting.findAll({ where: { isDeleted: false } })
    .then((data) => {
      res.json(data);
    })
    .catch((e) => {
      console.log('error :', e);
      res.status(404).json({ error: 'Error loading organization' });
    });
});

router.get('/:id', organizationAuthMiddleware, (req, res, next) => {
  Organization.findById(req.params.id)
    .then((organization) => {
      if (organization.subscriptionID) {
        Subscriptions.findById(organization.subscriptionID).then((subscription) => {
          return res.json({ organization: organization, subscription });
        });
      } else {
        return res.json({ organization: organization, subscription: [] });
      }
    })
    .catch((e) => {
      console.log('error :', e);
      res.status(404).json({ error: 'Error loading organization' });
    });
});

router.patch(
  '/:id',
  organizationAuthMiddleware,
  organizationLogoUpload.single('logo'),
  check('name').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

    if (req.file) req.body.logo = req.file.key;
    accessControlMiddleware.check('update', 'organization'),
      Organization.findById(req.params.id)
        .then((organization) => {
          if (organization.logo && req.file) removeUpload(organization.logo);
          return organization.update(req.body);
        })
        .then((updatedOrg) => {
          transferLog({
            req,
            productName: 'Organization Update',
            action: {
              UpdateRow: ` Organization Updatedsuccesfully `,
            },
            otherDetail: {
              Status: 'Done',
              updatedOrg: req.body,
            },
            purchaseOrderId: null,
            productId: null,
            rowId: req.params.id,
          });

          return res.json({ organization: updatedOrg });
        })
        .catch((e) => {
          console.log('error : ', e);
          transferLog({
            req,
            productName: 'Organization Update',
            action: {
              UpdateRow: ` Organization Updated Unsuccesfully `,
            },
            otherDetail: {
              Status: 'Done',
              error: `Error updating organization ${e}`,
            },
            purchaseOrderId: null,
            productId: null,
            rowId: req.params.id,
          });

          return res.status(422).json({ errors: 'Error updating organization' });
        });
  },
);

router.patch('/:id/add_hidden_lot', (req, res) => {
  accessControlMiddleware.check('update', 'organization'),
    Organization.findById(req.user.organizationId)
      .then((organization) => {
        let hiddenLots = Object.assign([], organization.hiddenLots);
        hiddenLots.push(req.body.hiddenLot);
        return organization.update({ hiddenLots });
      })
      .then((organization) => res.json({ organization }))
      .catch((e) => {
        console.log('error : ', e);
        return res.status(422).json({ errors: 'Error adding hidden lot' });
      });
});

router.patch('/:id/default-days-to-due-date', (req, res) => {
  accessControlMiddleware.check('update', 'organization'),
    PurchaseOrder.findById(req.params.id)
      .then((po) => {
        if (req.body.isInvoiceDueDate) {
          po.update({ invoiceDueDate: req.body.date });
        } else {
          po.update({ invoiceDate: req.body.date });
        }
      })
      .then((po) => {
        console.log(po);
        res.json({ po });
      })
      .catch((e) => {
        console.log('error : ', e);
        return res.status(422).json({ errors: 'Error updating days to due date' });
      });
  // Organization.findById(req.user.organizationId)
  //   .then((organization) => organization.update({ daysToInvoiceDueDateDefault: req.body.daysToDueDate }))
  //   .then((organization) => res.json({ organization }))
  //   .catch((e) => {
  //     console.log('error : ', e);
  //     return res.status(422).json({ errors: 'Error updating days to due date' });
  //   });
});

router.post('/add-message-settings', (req, res) => {
  SuperAdminSetting.create(req.body)
    .then((SuperAdminSetting) => res.json({ SuperAdminSetting }))
    .catch((e) => {
      console.log('error : ', e);
      return res.status(422).json({ errors: 'Error adding hidden lot' });
    });
});

router.patch('/:id/update-message-status', (req, res) => {
  console.log(req.params.id);
  SuperAdminSetting.update(
    { isSelected: false },
    {
      where: {
        isSelected: true,
      },
    },
  ).then(() => {
    SuperAdminSetting.update(req.body, { where: { id: req.params.id } })
      .then((po) => {
        console.log(po);
        res.json({ po });
      })
      .catch((e) => {
        console.log('error : ', e);
        return res.status(422).json({ errors: 'Error updating message status' });
      });
  });
});

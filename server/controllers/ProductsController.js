const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const { check, validationResult } = require('express-validator/check');
const { Product, Lot, ProductPackaging, CustomerProduct, PurchaseOrder, Customer } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  let query = {
    where: {
      organizationId: req.user.organizationId,
    },
    include: [
      {
        model: Lot,
        as: 'lots',
      },
    ],
  };

  if (req.query.seasonId) where.seasonId = seasonId;

  Product.all(query)
    .then((products) => {
      products.forEach((product) => {
        product.dataValues.lots = product.dataValues.lots.filter((lot) => !lot.isDeleted);
      });
      return res.json(filterDeletedListResponse(products));
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching product' });
    });
});

router.post(
  '/',
  check('seedType').exists(),
  check('brand').exists(),
  check('blend').exists(),
  check('treatment').exists(),
  check('quantity').exists(),
  check('msrp').exists(),
  check('rm').exists(),
  check('organizationId').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

    Product.create(req.body)
      .then((product) => product.updateLots(req.body.modifiedLotRows, req.user.organizationId))
      .then((product) => Product.findById(product.id, { include: ['lots'] }))
      .then((product) => res.json(product))
      .catch((e) => {
        console.log(e);
        res.status(422).json({ error: 'Error creating product' });
      });
  },
);

router.delete('/:id', async (req, res, next) => {
  ProductPackaging.destroy({ where: { productId: req.params.id } })
    .then(() => Lot.destroy({ where: { productId: req.params.id } }))
    .then(() => Product.destroy({ where: { id: req.params.id } }))
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      if (e.parent.table === 'CustomerProducts') {
        CustomerProduct.all({
          where: { productId: req.params.id },
          include: [{ model: PurchaseOrder }, { model: Customer }],
        }).then((response) => {
          let archived = [];
          let pos = [];
          let quotes = [];

          // Separate purchase orders into buckets
          response
            .map((r) => ({ purchaseOrder: r.PurchaseOrder, customer: r.Customer }))
            .forEach((item) => {
              if (
                (item.purchaseOrder.isArchived || item.purchaseOrder.isDeleted || item.customer.isDeleted) &&
                !archived.map((po) => po.id).includes(item.purchaseOrder.id)
              ) {
                archived.push(item.purchaseOrder);
              } else if (item.purchaseOrder.isQuote && !quotes.map((po) => po.id).includes(item.purchaseOrder.id)) {
                quotes.push(item.purchaseOrder);
              } else if (!pos.map((po) => po.id).includes(item.purchaseOrder.id)) {
                pos.push(item.purchaseOrder);
              }
            });

          // if pos and quotes is empty, delete archived
          if (!pos.length && !quotes.length) {
            if (archived.length) {
              PurchaseOrder.hardDestroy(archived.map((po) => po.id))
                .then(() => Product.destroy({ where: { id: req.params.id } }))
                .then(() => res.json({ ok: 'ok' }))
                .catch((e) => {
                  console.log('error : ', e);
                  res.status(422).json({ error: 'Error removing product' });
                });
            } else {
              Product.destroy({ where: { id: req.params.id } })
                .then(() => {
                  res.json({ ok: 'ok' });
                })
                .catch(() => res.status(422).json({ error: 'Error removing product' }));
            }
          } else {
            res.json({
              error: 'Existing quotes or purchase orders',
              poIds: pos.map((po) => po.id),
              quoteIds: quotes.map((q) => q.id),
            });
          }
        });
      } else {
        res.status(422).json({ error: 'Error removing product' });
      }
    });
});

router.patch(
  '/:id',
  check('seedType').exists(),
  check('brand').exists(),
  check('blend').exists(),
  check('treatment').exists(),
  check('quantity').exists(),
  check('msrp').exists(),
  check('rm').exists(),
  check('organizationId').exists(),
  (req, res, next) => {
    Product.findById(req.params.id)
      .then((product) => product.update(req.body))
      .then((product) => {
        if (
          req.body.modifiedLotRows &&
          req.body.modifiedLotRows.length > 0 &&
          req.body.modifiedLotRows[0].id &&
          req.body.modifiedLotRows[0].removeMe !== true
        ) {
          Lot.findById(req.body.modifiedLotRows[0].id)
            .then((lot) => {
              lot.update(req.body.modifiedLotRows[0]);
            })
            .then(() => Product.findById(req.params.id, { include: ['lots'] }))
            .then((product) => res.json(product))
            .catch((e) => {
              console.log('error : ', e);
              res.status(422).json({ error: 'Error updating product' });
            });
        } else {
          product
            .updateLots(req.body.modifiedLotRows, req.user.organizationId)
            .then((product) => Product.findById(product.id, { include: ['lots'] }))
            .then((product) => res.json(product))
            .catch((e) => {
              console.log('error : ', e);
              res.status(422).json({ error: 'Error updating product' });
            });
        }
      });
  },
);

router.get('/last_update', (req, res, next) => {
  Product.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"Product"."updatedAt" DESC'),
    limit: 1,
  })
    .then((products) => {
      let lastUpdate = (products[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const { CustomProduct, CustomLot } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
    include: [
      {
        model: CustomLot,
        as: 'customLots',
      },
    ],
  };

  CustomProduct.all(query)
    .then((customProducts) => {
      customProducts.forEach((customProduct) => {
        customProduct.dataValues.customLots = customProduct.dataValues.customLots.filter((lot) => !lot.isDeleted);
      });
      return res.json(filterDeletedListResponse(customProducts));
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching custom products' });
    });
});

router.post(
  '/',
  check('companyId').exists(),
  check('organizationId').exists(),
  check('name').exists(),
  check('unit').exists(),
  check('costUnit').exists(),
  check('quantity').exists(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

    CustomProduct.create(req.body)
      .then((product) => product.updateLots(req.body.modifiedLotRows, req.user.organizationId))
      .then((product) => CustomProduct.findById(product.id, { include: ['customLots'] }))
      .then((product) => res.json(product))
      .catch((e) => {
        console.log(e);
        res.status(422).json({ error: 'Error creating custom product' });
      });
  },
);

router.delete('/:id', (req, res, next) => {
  CustomProduct.destroy({ where: { id: req.params.id } })
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting customer product' });
    });
});

router.patch(
  '/:id',
  check('companyId').exists(),
  check('organizationId').exists(),
  check('name').exists(),
  check('unit').exists(),
  check('costUnit').exists(),
  check('quantity').exists(),
  (req, res, next) => {
    CustomProduct.findById(req.params.id)
      .then((customProduct) => customProduct.update(req.body))
      .then((customProduct) => {
        if (
          req.body.modifiedLotRows &&
          req.body.modifiedLotRows[0].id &&
          req.body.modifiedLotRows[0].removeMe !== true
        ) {
          CustomLot.findById(req.body.modifiedLotRows[0].id)
            .then((lot) => {
              lot.update(req.body.modifiedLotRows[0]);
            })
            .then(() => CustomProduct.findById(req.params.id, { include: ['customLots'] }))
            .then((customProduct) => res.json(customProduct))
            .catch((e) => {
              console.log('error : ', e);
              res.status(422).json({ error: 'Error updating product' });
            });
        } else {
          customProduct
            .updateLots(req.body.modifiedLotRows, req.user.organizationId)
            .then((customProduct) => CustomProduct.findById(customProduct.id, { include: ['customLots'] }))
            .then((customProduct) => res.json(customProduct))
            .catch((e) => {
              console.log('error : ', e);
              res.status(422).json({ error: 'Error updating product' });
            });
        }
      })

      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error updating custom product' });
      });
  },
);

router.get('/last_update', (req, res) => {
  CustomProduct.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"CustomProduct"."updatedAt" DESC'),
    limit: 1,
  })
    .then((customProducts) => {
      let lastUpdate = (customProducts[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

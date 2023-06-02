const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { DealerDiscount } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };

  DealerDiscount.all(query)
    .then((dealerDiscounts) => res.json(filterDeletedListResponse(dealerDiscounts)))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching dealer discounts' });
    });
});

router.post('/', (req, res, next) => {
  accessControlMiddleware.check('create', 'discount'),
    DealerDiscount.create(req.body)
      .then((dealerDiscount) => res.json(dealerDiscount))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error creating dealer discount' });
      });
});

router.patch('/:id', (req, res, next) => {
  accessControlMiddleware.check('update', 'discount'),
    DealerDiscount.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    })
      .then((discount) => discount.update(req.body))
      .then((discount) => res.json(discount))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error updating dealer discount' });
      });
});

router.delete('/:id', (req, res, next) => {
  accessControlMiddleware.check('delete', 'discount'),
    DealerDiscount.findById(req.params.id)
      .then((dealerDiscount) => dealerDiscount.update({ isDeleted: 'true' }, { where: { id: req.params.id } }))
      .then(() => res.json({ ok: 'ok' }))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error deleting dealer discount' });
      });
});

router.get('/last_update', (req, res) => {
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

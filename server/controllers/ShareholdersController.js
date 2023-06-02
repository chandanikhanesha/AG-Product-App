const { Router } = require('express');
const Sequelize = require('sequelize');
const { check, validationResult } = require('express-validator/check');
const { Customer, Shareholder } = require('models');

const router = (module.exports = Router({ mergeParams: true }));

router.get('/', (req, res) => {
  Shareholder.all({
    include: [
      {
        model: Customer,
        attributes: ['organizationId'],
        where: { organizationId: req.user.organizationId },
      },
    ],
  })
    .then((shareholders) => res.json(shareholders))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error getting shareholders' });
    });
});

router.post('/', check('name').exists(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  let customerId = req.params.customer_id;
  let params = Object.assign({}, { customerId }, req.body);
  Shareholder.create(params)
    .then((shareholder) => res.json(shareholder))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating shareholder' });
    });
});

router.patch('/', check('name').exists(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  let customerId = req.params.customer_id;
  let id = req.body.id;
  delete req.body.id;
  let params = Object.assign({}, { customerId }, req.body);
  Shareholder.update(params, {
    where: {
      id,
    },
  })
    .then((shareholder) => res.json(shareholder))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating shareholder' });
    });
});

router.delete('/:id', (req, res) => {
  Shareholder.destroy({ where: { id: req.params.id } })
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting shareholder' });
    });
});

router.get('/last_update', (req, res, next) => {
  Shareholder.all({
    include: [
      {
        model: Customer,
        select: 'organizationId',
        attributes: ['organizationId'],
        where: { organizationId: req.user.organizationId },
      },
    ],
    order: Sequelize.literal('"Shareholder"."updatedAt" DESC'),
    limit: 1,
  })
    .then((shareholders) => {
      let lastUpdate = (shareholders[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

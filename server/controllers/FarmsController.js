const { Router } = require('express');
const Sequelize = require('sequelize');
const { check, validationResult } = require('express-validator/check');
const { Customer, Farm } = require('models');

const router = (module.exports = Router({ mergeParams: true }));

// TODO: even though this route is scoped to the customer id, it returns all farms for the organization
router.get('/', (req, res) => {
  Farm.all({
    include: [
      {
        model: Customer,
        attributes: ['organizationId'],
        where: { organizationId: req.user.organizationId },
      },
    ],
  })
    .then((farms) => res.json(farms))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error listing farms' });
    });
});

router.post('/', check('name').exists(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  let customerId = req.params.customer_id;
  let params = Object.assign({}, { customerId }, req.body);
  Farm.create(params)
    .then((farm) => res.json(farm))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating farm' });
    });
});

router.patch('/:id', (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  const customerId = req.params.customer_id;

  Farm.findOne({
    where: {
      customerId,
      id: req.params.id,
    },
  })
    .then((farm) => farm.update(req.body))
    .then((farm) => res.json(farm))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating farm' });
    });
});

router.delete('/:id', (req, res) => {
  let customerId = req.params.customer_id;
  Farm.destroy({ where: { customerId: customerId, id: req.params.id } })
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting farm' });
    });
});

router.get('/last_update', (req, res, next) => {
  Farm.all({
    include: [
      {
        model: Customer,
        attributes: ['organizationId'],
        where: { organizationId: req.user.organizationId },
      },
    ],
    order: Sequelize.literal('"Farm"."updatedAt" DESC'),
    limit: 1,
  })
    .then((farms) => {
      let lastUpdate = (farms[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

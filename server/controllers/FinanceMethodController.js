const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('../middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { FinanceMethod } = require('../models');
const { filterDeletedListResponse } = require('../utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };
  FinanceMethod.findAll(query)
    .then((financeMethods) => {
      res.json(filterDeletedListResponse(financeMethods));
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching finance methods' });
    });
});

router.get('/detail/:id', (req, res, next) => {
  const query = {
    where: {
      id: req.body.id,
      organizationId: req.user.organizationId,
    },
  };

  FinanceMethod.findById(req.params.id)
    .then((financeMethod) => {
      res.json(financeMethod);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching finance method by id' });
    });
});

router.post('/', (req, res, next) => {
  //accessControlMiddleware.check('create', 'financeMethod'),
  FinanceMethod.create(req.body)
    .then((financeMethod) => res.json(financeMethod))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating finance method' });
    });
});

router.patch('/:id', (req, res, next) => {
  //accessControlMiddleware.check('update', 'financeMethod'),
  FinanceMethod.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((financeMethod) => financeMethod.update(req.body))
    .then((financeMethod) => res.json(financeMethod))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating finance method' });
    });
});

router.delete('/:id', (req, res, next) => {
  //accessControlMiddleware.check("delete", "financeMethod"),
  FinanceMethod.findById(req.params.id)
    .then((financeMethod) => financeMethod.destroy())
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting finance method' });
    });
});

router.get('/last_update', (req, res) => {
  FinanceMethod.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"FinanceMethod"."updatedAt" DESC'),
    limit: 1,
  })
    .then((financeMethods) => {
      let lastUpdate = (financeMethods[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last updated finance method' });
    });
});

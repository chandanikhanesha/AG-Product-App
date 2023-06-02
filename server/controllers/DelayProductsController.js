const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('../middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { DelayProduct } = require('../models');
const { filterDeletedListResponse } = require('../utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };
  DelayProduct.findAll(query)
    .then((delayProducts) => {
      res.json(filterDeletedListResponse(delayProducts));
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching delay products' });
    });
});

router.get('/detail/:id', (req, res, next) => {
  const query = {
    where: {
      id: req.body.id,
      organizationId: req.user.organizationId,
    },
  };

  DelayProduct.findById(req.params.id)
    .then((delayProduct) => {
      res.json(delayProduct);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching delay product by id' });
    });
});

router.post('/', (req, res, next) => {
  //accessControlMiddleware.check('create', 'delayProduct'),
  DelayProduct.create(req.body)
    .then((delayProduct) => res.json(delayProduct))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating delay product' });
    });
});

router.patch('/:id', (req, res, next) => {
  //accessControlMiddleware.check('update', 'delayProduct'),
  DelayProduct.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((delayProduct) => delayProduct.update(req.body))
    .then((delayProduct) => res.json(delayProduct))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating delay product' });
    });
});

router.delete('/:id', (req, res, next) => {
  //accessControlMiddleware.check("delete", "delayProduct"),
  DelayProduct.findById(req.params.id)
    .then((delayProduct) => delayProduct.destroy())
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting delay product' });
    });
});

router.get('/last_update', (req, res) => {
  DelayProduct.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"DelayProduct"."updatedAt" DESC'),
    limit: 1,
  })
    .then((delayProducts) => {
      let lastUpdate = (delayProducts[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last updated delay product' });
    });
});

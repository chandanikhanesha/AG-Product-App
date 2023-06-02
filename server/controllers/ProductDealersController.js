const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { ProductDealer } = require('models');
const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  ProductDealer.all({
    where: {
      organizationId: req.user.organizationId,
    },
  })
    .then((productDealers) => res.json(productDealers))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching productDealers' });
    });
});

router.post('/', async (req, res, next) => {
  const isExits = await ProductDealer.findOne({
    where: {
      name: req.body.name,
    },
    raw: true,
  });

  if (!isExits) {
    let productDealer = new ProductDealer(req.body);
    productDealer.organizationId = req.user.organizationId;
    // accessControlMiddleware.check('create', 'productDealer'),
    productDealer
      .save()
      .then((newProductDealer) => res.json(newProductDealer))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error creating productDealer' });
      });
  } else {
    res.status(404).json({ error: 'Dealer name alredy exits' });
  }
});

router.patch('/:id', (req, res, next) => {
  // accessControlMiddleware.check('update', 'productDealer'),
  ProductDealer.findOne({
    where: {
      id: req.params.id,
    },
  })
    .then((productDealer) => productDealer.update(req.body))
    .then((productDealer) => res.json(productDealer))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating productDealer' });
    });
});

router.delete('/:id', (req, res, next) => {
  // accessControlMiddleware.check('delete', 'productDealer'),
  ProductDealer.findById(req.params.id)
    .then((productDealer) => productDealer.destroy())
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting productDealer' });
    });
});

router.get('/last_update', (req, res) => {
  ProductDealer.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"ProductDealer"."updatedAt" DESC'),
    limit: 1,
  })
    .then((productDealers) => {
      let lastUpdate = (productDealers[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

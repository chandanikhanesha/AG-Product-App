const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { DiscountPackage } = require('models');
const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  DiscountPackage.all({ where: { organizationId: req.user.organizationId } })
    .then((discountPackages) => res.json(discountPackages))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching discount packages' });
    });
});

router.post('/', accessControlMiddleware.check('create', 'discountPackage'), (req, res, next) => {
  let package = new DiscountPackage(req.body);
  package.organizationId = req.user.organizationId;

  package
    .save()
    .then((newPackage) => res.json(newPackage))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating discount package' });
    });
});

router.patch('/:id', (req, res, next) => {
  accessControlMiddleware.check('update', 'discountPackage'),
    DiscountPackage.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    })
      .then((discountPackage) => discountPackage.update(req.body))
      .then((discountPackage) => res.json(discountPackage))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error updating discount package' });
      });
});

router.delete('/:id', accessControlMiddleware.check('delete', 'discountPackage'), (req, res, next) => {
  DiscountPackage.findById(req.params.id)
    .then((discountPackage) => discountPackage.destroy())
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting discount package' });
    });
});

router.get('/last_update', (req, res) => {
  DiscountPackage.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"DiscountPackage"."updatedAt" DESC'),
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

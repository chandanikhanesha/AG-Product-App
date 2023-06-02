const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const { filterDeletedListResponse } = require('utilities');

const { ProductPackaging, PurchaseOrder } = require('models');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  ProductPackaging.all({
    where: {
      organizationId: req.user.organizationId,
    },
  })
    .then((productPackagings) => res.json(filterDeletedListResponse(productPackagings)))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching productPackagings' });
    });
});

router.post('/', (req, res, next) => {
  let newProductPackaging = req.body;
  newProductPackaging.organizationId = req.user.organizationId;
  const { organizationId, productId, purchaseOrderId } = newProductPackaging;

  ProductPackaging.findCreateFind({ where: { organizationId, productId, purchaseOrderId } })
    .then((response) => {
      let productPackaging = response[0];
      return productPackaging.update({ packagingGroups: newProductPackaging.packagingGroups });
    })
    .then((updatdProductPackaging) => res.json(updatdProductPackaging))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating productPackaging' });
    });
});

router.patch('/:id', (req, res, next) => {
  ProductPackaging.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((productPackaging) => productPackaging.update(req.body))
    .then((productPackaging) => res.json(productPackaging))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating productPackaging' });
    });
});

router.get('/last_update', (req, res) => {
  ProductPackaging.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"ProductPackaging"."updatedAt" DESC'),
    limit: 1,
  })
    .then((productPackagings) => {
      let lastUpdate = (productPackagings[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

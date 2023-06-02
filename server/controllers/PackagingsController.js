const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { Packaging } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  Packaging.all({
    where: {
      organizationId: req.user.organizationId,
      isDeleted: false,
    },
  })
    .then((packagings) => res.json(filterDeletedListResponse(packagings)))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching packagings' });
    });
});

router.post('/', (req, res, next) => {
  let packaging = new Packaging(req.body);
  packaging.organizationId = req.user.organizationId;

  accessControlMiddleware.check('create', 'packaging'),
    packaging
      .save()
      .then((newPackaging) => res.json(newPackaging))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error creating packaging' });
      });
});

router.patch('/:id', (req, res, next) => {
  accessControlMiddleware.check('update', 'packaging'),
    Packaging.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    })
      .then((packaging) => packaging.update(req.body))
      .then((packaging) => res.json(packaging))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error updating packaging' });
      });
});

router.delete('/:id', (req, res, next) => {
  accessControlMiddleware.check('delete', 'packaging'),
    Packaging.findById(req.params.id)
      .then((packaging) => packaging.update({ isDeleted: true }))
      .then(() => res.json({ ok: 'ok' }))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error deleting packaging' });
      });
});

router.get('/last_update', (req, res) => {
  Packaging.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"Packaging"."updatedAt" DESC'),
    limit: 1,
  })
    .then((packagings) => {
      let lastUpdate = (packagings[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

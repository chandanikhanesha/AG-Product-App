const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { SeedSize, Lot } = require('models');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  SeedSize.all({
    where: {
      organizationId: req.user.organizationId,
      isDeleted: false,
    },
  })
    .then((seedSizes) => res.json(seedSizes))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching seedSizes' });
    });
});

router.post('/', (req, res, next) => {
  let seedSize = new SeedSize(req.body);
  seedSize.organizationId = req.user.organizationId;

  accessControlMiddleware.check('create', 'seedSize'),
    seedSize
      .save()
      .then((newSeedSize) => res.json(newSeedSize))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error creating seedSize' });
      });
});

router.patch('/:id', (req, res, next) => {
  accessControlMiddleware.check('update', 'seedSize'),
    SeedSize.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    })
      .then((seedSize) => seedSize.update(req.body))
      .then((seedSize) => res.json(seedSize))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error updating seedSize' });
      });
});

router.delete('/:id', (req, res, next) => {
  accessControlMiddleware.check('delete', 'seedSize'),
    SeedSize.findById(req.params.id)
      .then((seedSize) => seedSize.update({ isDeleted: true }))
      .then(() => res.json({ ok: 'ok' }))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: `Error deleting seedSize-${e}` });
      });
});

router.get('/last_update', (req, res) => {
  SeedSize.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"SeedSize"."updatedAt" DESC'),
    limit: 1,
  })
    .then((seedSizes) => {
      let lastUpdate = (seedSizes[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { SeedCompany, Product, Lot } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  SeedCompany.all({
    where: {
      organizationId: req.user.organizationId,
    },
    include: [
      {
        model: Product,

        include: [
          {
            model: Lot,
            as: 'lots',
          },
        ],
      },
    ],
  })
    .then((seedCompanies) => res.json(filterDeletedListResponse(seedCompanies)))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errro: e.message });
    });
});

router.post('/', check('name').exists(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  let seedCompany = new SeedCompany(req.body);
  seedCompany.organizationId = req.user.organizationId;

  accessControlMiddleware.check('create', 'seedCompany'),
    seedCompany
      .save()
      .then((newSeedCompany) => res.json(newSeedCompany))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error creating seedCompany' });
      });
});

router.patch('/:id', check('name').exists(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  accessControlMiddleware.check('update', 'seedCompany');
  SeedCompany.update(req.body, {
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((seedCompany) => res.json(seedCompany))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating seedCompany' });
    });
});

router.get('/last_update', (req, res) => {
  SeedCompany.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"SeedCompany"."updatedAt" DESC'),
    limit: 1,
  })
    .then((seedCompanies) => {
      let lastUpdate = (seedCompanies[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

router.delete('/:id', (req, res) => {
  let seedCompany;
  accessControlMiddleware.check('delete', 'seedCompany'),
    SeedCompany.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    })
      .then((response) => {
        seedCompany = response;
        return seedCompany.update({ isDeleted: true });
      })
      .then(() => seedCompany.softDestroy(seedCompany.id))
      .then(() => res.json(seedCompany))
      .catch((e) => {
        console.log('error : ', e);
        return res.status(422).json({ errors: 'Error deleting seedCompany ' });
      });
});

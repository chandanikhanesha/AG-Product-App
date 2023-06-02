const { Router } = require('express');
const { check, validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const { Company, CustomProduct } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res) => {
  Company.all({
    where: { organizationId: req.user.organizationId },
    include: [
      {
        model: CustomProduct,
      },
    ],
  })
    .then((companies) => res.json(filterDeletedListResponse(companies)))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error listing companies' });
    });
});

router.post('/', check('name').exists(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  let company = new Company(req.body);
  company.organizationId = req.user.organizationId;

  company
    .save()
    .then((newCompany) => res.json(newCompany))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating company' });
    });
});

router.patch('/:id', check('name').exists(), (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  Company.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((company) => company.update(req.body))
    .then((company) => res.json(company))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating company' });
    });
});

router.get('/last_update', (req, res) => {
  Company.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"Company"."updatedAt" DESC'),
    limit: 1,
  })
    .then((companies) => {
      let lastUpdate = (companies[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

router.delete('/:id', (req, res) => {
  let company;
  Company.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((response) => {
      company = response;
      return company.update({ isDeleted: true });
    })
    .then(() => company.softDestroy(company.id))
    .then(() => res.json(company))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error deleting company ' });
    });
});

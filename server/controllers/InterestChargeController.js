const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('../middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { InterestCharge } = require('../models');
const { filterDeletedListResponse } = require('../utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };

  InterestCharge.all(query)
    .then((interestCharges) => res.json(filterDeletedListResponse(interestCharges)))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching interesr charges' });
    });
});

router.post('/', (req, res, next) => {
  accessControlMiddleware.check('create', 'interestCharge'),
    InterestCharge.create(req.body)
      .then((interestCharge) => res.json(interestCharge))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error creating interest charge' });
      });
});
// testing prettier
router.patch('/:id', (req, res, next) => {
  accessControlMiddleware.check('update', 'interestCharge'),
    InterestCharge.findOne({
      where: {
        id: req.params.id,
        organizationId: req.user.organizationId,
      },
    })
      .then((interestCharge) => interestCharge.update(req.body))
      .then((interestCharge) => res.json(interestCharge))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error updating interest charge' });
      });
});

router.delete('/:id', (req, res, next) => {
  accessControlMiddleware.check('delete', 'interestCharge'),
    InterestCharge.findById(req.params.id)
      .then((interestCharge) => interestCharge.destroy())
      .then(() => res.json({ ok: 'ok' }))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error deleting interest charge' });
      });
});

router.get('/last_update', (req, res) => {
  InterestCharge.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"InterestCharge"."updatedAt" DESC'),
    limit: 1,
  })
    .then((interestCharges) => {
      let lastUpdate = (interestCharges[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

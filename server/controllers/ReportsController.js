const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('middleware/userAuth');
const { Report } = require('models');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  Report.all({
    where: {
      organizationId: req.user.organizationId,
    },
  })
    .then((reports) => {
      return res.json(reports);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error fetching reports' });
    });
});

router.post('/', (req, res) => {
  const organizationId = req.user.organizationId;
  Report.create({ organizationId })
    .then((report) => {
      res.json(report);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(400).json({ errors: 'Error creating a report' });
    });
});

router.delete('/:id', (req, res) => {
  const organizationId = req.user.organizationId;
  const reportToDestroy = { organizationId, id: req.params.id };
  Report.destroy({ where: reportToDestroy })
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting report' });
    });
});

router.patch('/:id', (req, res) => {
  Payment.findById(req.params.id)
    .then((report) => report.update(req.body))
    .then((updatedReport) => res.json(updatedReport))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating report' });
    });
});

router.get('/last_update', (req, res) => {
  Report.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"Report"."updatedAt" DESC'),
    limit: 1,
  })
    .then((reports) => {
      let lastUpdate = (reports[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

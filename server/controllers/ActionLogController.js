const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('../middleware/userAuth');
const { ActionLog } = require('../models');
const { filterDeletedListResponse } = require('../utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };

  ActionLog.all(query)
    .then((actionLogs) => res.json(filterDeletedListResponse(actionLogs)))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching action logs' });
    });
});

router.post('/', (req, res, next) => {
  // console.log(req.body)
  ActionLog.create(req.body)
    .then((actionLog) => res.json(actionLog))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating action log' });
    });
});

router.patch('/:id', (req, res, next) => {
  ActionLog.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((actionLog) => actionLog.update(req.body))
    .then((actionLog) => res.json(actionLog))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating action log' });
    });
});

router.delete('/:id', (req, res, next) => {
  ActionLog.findById(req.params.id)
    .then((actionLog) => actionLog.destroy())
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting action log' });
    });
});

router.get('/last_update', (req, res) => {
  ActionLog.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"ActionLog"."updatedAt" DESC'),
    limit: 1,
  })
    .then((actionLogs) => {
      let lastUpdate = (actionLogs[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

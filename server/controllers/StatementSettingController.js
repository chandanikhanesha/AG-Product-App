const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('../middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { StatementSetting } = require('../models');
const { filterDeletedListResponse } = require('../utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };
  StatementSetting.findAll(query)
    .then((statementSettings) => {
      res.json(filterDeletedListResponse(statementSettings));
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching statement settings' });
    });
});

router.get('/detail/:id', (req, res, next) => {
  const query = {
    where: {
      id: req.body.id,
      organizationId: req.user.organizationId,
    },
  };

  StatementSetting.findById(req.params.id)
    .then((statementSetting) => {
      res.json(statementSetting);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching statement setting by id' });
    });
});

router.post('/', (req, res, next) => {
  //accessControlMiddleware.check('create', 'statementSetting'),
  StatementSetting.create(req.body)
    .then((statementSetting) => res.json(statementSetting))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating statement setting' });
    });
});

router.patch('/:id', (req, res, next) => {
  //accessControlMiddleware.check('update', 'statementSetting'),
  StatementSetting.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((statementSetting) => statementSetting.update(req.body))
    .then((statementSetting) => res.json(statementSetting))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating statement setting' });
    });
});

router.delete('/:id', (req, res, next) => {
  //accessControlMiddleware.check("delete", "statementSetting"),
  StatementSetting.findById(req.params.id)
    .then((statementSetting) => statementSetting.destroy())
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting statement setting' });
    });
});

router.get('/last_update', (req, res) => {
  StatementSetting.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"StatementSetting"."updatedAt" DESC'),
    limit: 1,
  })
    .then((statementSettings) => {
      let lastUpdate = (statementSettings[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last updated statement setting' });
    });
});

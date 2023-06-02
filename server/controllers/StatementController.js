const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('../middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { Statement, PurchaseOrderStatement } = require('../models');
const { filterDeletedListResponse } = require('../utilities');
const { doStatementJob } = require('../cron_statement');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };
  Statement.findAll(query)
    .then((statements) => {
      res.json(filterDeletedListResponse(statements));
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching statements' });
    });
});

router.get('/detail/:id', (req, res, next) => {
  const query = {
    where: {
      id: req.body.id,
      organizationId: req.user.organizationId,
    },
  };

  Statement.findById(req.params.id)
    .then((statement) => {
      res.json(statement);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching statement by id' });
    });
});

router.post('/', async (req, res, next) => {
  //accessControlMiddleware.check('create', 'statement'),
  //console.log(req.body)
  try {
    const statement = await Statement.create(req.body);

    const statementId = statement.id;
    const statementNo =
      (statementId < 10 ? '000' : statementId < 100 ? '00' : statementId < 1000 ? '0' : '') + statementId;
    const updateData = { statementNo };
    await statement.update(updateData);
    res.json({ ...statement.toJSON(), statementNo });
  } catch (e) {
    console.log('error : ', e);
    res.status(422).json({ error: 'Error creating statement' });
  }
});

router.patch('/:id', (req, res, next) => {
  //accessControlMiddleware.check('update', 'statement'),
  Statement.findOne({
    where: {
      id: req.params.id,
      organizationId: req.user.organizationId,
    },
  })
    .then((statement) => statement.update(req.body))
    .then((statement) => res.json(statement))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating statement' });
    });
});

router.delete('/:id', (req, res, next) => {
  //accessControlMiddleware.check('delete', 'statement'),
  PurchaseOrderStatement.destroy({
    where: { statementId: req.params.id },
  }).then(
    Statement.findById(req.params.id)
      .then((statement) => statement.destroy())
      .then(() => res.json({ ok: 'ok' }))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error deleting statement' });
      }),
  );
});

router.get('/last_update', (req, res) => {
  Statement.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"Statement"."updatedAt" DESC'),
    limit: 1,
  })
    .then((statements) => {
      let lastUpdate = (statements[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last updated statement' });
    });
});

router.get('/create_now', (req, res) => {
  doStatementJob();
});

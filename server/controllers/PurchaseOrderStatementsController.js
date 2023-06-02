const { Router } = require('express');
const Sequelize = require('sequelize');

const authMiddleware = require('../middleware/userAuth');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { PurchaseOrderStatement } = require('../models');
const { filterDeletedListResponse } = require('../utilities');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res, next) => {
  const query = {
    where: {
      organizationId: req.user.organizationId,
    },
  };
  PurchaseOrderStatement.findAll(query)
    .then((purchaseOrderStatements) => {
      res.json(filterDeletedListResponse(purchaseOrderStatements));
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching purchase order statements' });
    });
});

router.get('/detail/:id', (req, res, next) => {
  const query = {
    where: {
      id: req.body.id,
      organizationId: req.user.organizationId,
    },
  };

  PurchaseOrderStatement.findById(req.body.id)
    .then((purchaseOrderStatement) => {
      res.json(purchaseOrderStatement);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error fetching purchase order statement by id' });
    });
});

router.post('/', (req, res, next) => {
  //accessControlMiddleware.check('create', 'purchaseOrderStatement'),
  PurchaseOrderStatement.create(req.body)
    .then((purchaseOrderStatement) => res.json(purchaseOrderStatement))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating purchase order statement' });
    });
});

router.patch('/update', (req, res, next) => {
  //accessControlMiddleware.check('update', 'statement'),
  //console.log(req.body)
  PurchaseOrderStatement.findOne({
    where: {
      statementId: req.body.statementId,
      purchaseOrderId: req.body.purchaseOrderId,
      organizationId: req.user.organizationId,
    },
  })
    .then((purchaseOrderStatement) => purchaseOrderStatement.update(req.body))
    .then((purchaseOrderStatement) => res.json(purchaseOrderStatement))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating purchase order statement' });
    });
});

// router.delete("/:id", (req, res, next) => {
//   //accessControlMiddleware.check('delete', 'statement'),
//   PurchaseOrderStatement.destroy({ where: { statementId: req.params.id } })
//     .then(() => res.json({ ok: "ok" }))
//     .catch(e => {
//       console.log("error : ", e);
//       res
//         .status(422)
//         .json({ error: "Error deleting purchase order statement" });
//     });
// });

router.get('/last_update', (req, res) => {
  PurchaseOrderStatement.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"PurchaseOrderStatement"."updatedAt" DESC'),
    limit: 1,
  })
    .then((purchaseOrderStatements) => {
      let lastUpdate = (purchaseOrderStatements[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({
        errors: 'Error getting last updated purchase order statement',
      });
    });
});

const { Router } = require('express');
const Sequelize = require('sequelize');
const { Payment, PurchaseOrder } = require('models');
const { filterDeletedListResponse } = require('utilities');
const accessControlMiddleware = require('../middleware/accessControlCheck');
const { create: actionLogCreator } = require('../middleware/actionLogCreator');

const router = (module.exports = Router({ mergeParams: true }));

// TODO: this request is scoped to the purchase order id
//  however it returns all payments for an organization
router.get('/', (req, res, next) => {
  Payment.all({
    include: [
      {
        model: PurchaseOrder,
        attributes: ['organizationId'],
        where: {
          organizationId: req.user.organizationId,
        },
      },
    ],
  })
    .then((payments) => res.json(filterDeletedListResponse(payments)))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching payments' });
    });
});

router.post('/', accessControlMiddleware.check('create', 'payment'), (req, res, next) => {
  let payment = new Payment(req.body);
  payment.purchaseOrderId = req.params.purchase_order_id;
  if (!req.body.paymentDate) payment.paymentDate = new Date();

  payment
    .save()
    .then((newPayment) => {
      actionLogCreator({
        req,
        operation: 'create',
        type: 'payment',
        typeId: newPayment.id,
        previousData: {},
        changedData: req.body,
      });
      res.json(newPayment);
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error creating payment' });
    });
});

router.delete('/:id', accessControlMiddleware.check('delete', 'payment'), (req, res, next) => {
  let previousData;
  Payment.findById(req.params.id)
    .then((payment) => {
      previousData = payment;
      payment.destroy();
    })
    .then(() => {
      actionLogCreator({
        req,
        operation: 'delete',
        type: 'payment',
        typeId: req.params.id,
        previousData: req.body,
        changedData: {},
      });
      res.json({ ok: 'ok' });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting payment' });
    });
});

router.patch('/:id', accessControlMiddleware.check('update', 'purchaseOrder'), (req, res) => {
  let previousData;

  Payment.findById(req.params.id).then((payment) => {
    previousData = payment;
    payment
      .update(req.body)
      .then((updatedPayment) => {
        actionLogCreator({
          req,
          operation: 'update',
          type: 'payment',
          typeId: req.params.id,
          previousData,
          changedData: req.body,
        });
        res.json(updatedPayment);
      })
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error updating payment' });
      });
  });
});

router.get('/last_update', (req, res, next) => {
  Payment.all({
    include: [
      {
        model: PurchaseOrder,
        attributes: ['organizationId'],
        where: { organizationId: req.user.organizationId },
      },
    ],
    order: Sequelize.literal('"Payment"."updatedAt" DESC'),
    limit: 1,
  })
    .then((payments) => {
      let lastUpdate = (payments[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

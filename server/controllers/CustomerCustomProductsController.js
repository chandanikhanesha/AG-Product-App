const { Router } = require('express');
const Sequelize = require('sequelize');
const { create: transferLog } = require('../middleware/transferLog');

const { CustomerCustomProduct, PurchaseOrder, DiscountReport, CustomProduct, Farm, Company } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router({ mergeParams: true }));

// TODO: even though this route is scoped to the customer id, it returns all for the organization
router.get('/', (req, res, next) => {
  CustomerCustomProduct.all({
    where: {
      organizationId: req.user.organizationId,
    },
    include: [
      {
        model: CustomProduct,
        as: 'CustomProduct',
        include: [{ model: Company, as: 'Company' }],
      },
      { model: Farm, as: 'Farm' },

      {
        model: PurchaseOrder,
        as: 'PurchaseOrder',
      },
    ],
  })
    .then((customerCustomProduct) => res.json(filterDeletedListResponse(customerCustomProduct)))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetchin customer products' });
    });
});

router.post('/', async (req, res, next) => {
  let customerId = req.params.customer_id;
  const organizationId = req.user.organizationId;
  let {
    purchaseOrderId,
    productId,
    quantity,
    amountDelivered,
    discounts,
    farmId,

    fieldName,
    orderDate,
    comment,
  } = req.body;
  const po = await PurchaseOrder.findOne({
    where: {
      id: purchaseOrderId,
      organizationId: organizationId,
    },
    raw: true,
  });
  CustomerCustomProduct.all({
    where: {
      purchaseOrderId: purchaseOrderId,
      customerId: customerId,
      organizationId: organizationId,
      customProductId: productId,
    },
  }).then((customerCustomProducts) => {
    let msrpEditedProduct = customerCustomProducts.find(
      (_customerCustomProduct) => _customerCustomProduct.msrpEdited != null,
    );

    CustomerCustomProduct.create({
      purchaseOrderId: purchaseOrderId,
      customerId: customerId,
      organizationId: organizationId,
      customProductId: productId,
      orderQty: quantity,
      msrpEdited: msrpEditedProduct ? msrpEditedProduct.msrpEdited : null,
      amountDelivered,
      discounts,
      farmId: farmId || farmId,
      fieldName,
      orderDate,
      comment,
      isReplant: po ? po.isReplant : false,
    })
      .then((customerCustomProduct) => {
        transferLog({
          req,
          productName: 'Regular Product',
          action: {
            AddedNewRow: `Add new product with Quantity${quantity} `,
          },
          otherDetail: {
            Status: 'Added succesfully',
          },
          purchaseOrderId: purchaseOrderId,
          productId: productId,
          rowId: customerCustomProduct.dataValues.id,
        });
        res.json(customerCustomProduct);
      })
      .catch((e) => {
        console.log(e);
        transferLog({
          req,
          productName: 'Regular Product',
          action: {
            AddedNewRow: `Error While Addding new customerCustomProduct with Quantity${quantity} `,
          },
          otherDetail: {
            Status: 'Added Unsuccesfully',
            Error: `Error creating customerCustomProduct product ${e}`,
          },
          purchaseOrderId: purchaseOrderId,
          productId: productId,
          rowId: null,
        });
        res.status(422).json({ error: 'Error creating customer product' });
      });
    DiscountReport.update({ isLoad: true }, { where: { purchaseOrderId: purchaseOrderId } });
  });
});

// router.put('/', (req, res, next) => {
//   let customerId = req.params.customer_id
//   let { data } = req.body
//   //pass records to update and a WHERE clause
//   // updating amountDelivered field for each the records in data
//   // set {returning: true, where: {id: //data record id }
//   CustomerProduct.update()
//   .then(([rowsUpdated,[updatedCustomerCustomProducts]]) => res.json(updatedCustomerCustomProducts))
//   .catch(e => {
//     console.log(e)
//     res.status(422).json({error: 'Error creating customer product'})
//   })
// })

router.delete('/:id', (req, res, next) => {
  let customerCustomProductId = req.params.id;
  CustomerCustomProduct.findById(customerCustomProductId)
    .then((customerCustomerProduct) => customerCustomerProduct.destroy())
    .then((customerCustomerProduct) => {
      transferLog({
        req,
        productName: 'Regular Product',
        action: {
          DeleteRow: `deleted succesfully `,
        },
        otherDetail: {
          Status: 'Done',
        },
        purchaseOrderId: null,
        productId: null,
        rowId: req.params.id,
      });

      res.json({ ok: 'ok' });
    })
    .catch(async (e) => {
      console.log('error : ', e);
      // const customerCustomerProduct = await CustomerCustomProduct.findById(customerCustomProductId);
      // transferLog({
      //   req,
      //   productName: 'Regular Product',
      //   action: {
      //     DeleteRow: `deleted Unsuccesfully `,
      //   },
      //   otherDetail: {
      //     Status: 'UnDone',
      //     Error: `Error While deleting customerCustomerProduct ${e}`,
      //   },
      //   purchaseOrderId: customerCustomerProduct.dataValues.purchaseOrderId,
      //   productId: customerCustomerProduct.dataValues.productId,
      //   rowId: req.params.id,
      // });
      res.status(422).json({ error: 'Error deleting customer product' });
    });
});

router.patch('/:id', async (req, res) => {
  CustomerCustomProduct.findById(req.params.id)
    .then(async (customerCustomProduct) => {
      await customerCustomProduct.update(req.body, {
        where: { id: req.params.id },
      });

      if (req.body.msrpEdited) {
        CustomerCustomProduct.all({
          where: {
            organizationId: customerCustomProduct.organizationId,
            purchaseOrderId: customerCustomProduct.purchaseOrderId,
            customerId: customerCustomProduct.customerId,
            customProductId: customerCustomProduct.customProductId,
            id: req.params.id,
          },
        }).then((customerCustomProducts) => {
          customerCustomProducts.forEach((_customerCustomProduct) =>
            _customerCustomProduct.update({ msrpEdited: req.body.msrpEdited }),
          );
        });
      }
    })
    .then(async (data) => {
      const updated = await CustomerCustomProduct.findById(req.params.id);
      DiscountReport.update({ isLoad: true }, { where: { purchaseOrderId: updated.purchaseOrderId } });
      transferLog({
        req,
        productName: 'Regular Product',
        action: {
          UpdateRow: `Updated succesfully `,
        },
        otherDetail: {
          Status: 'Done',
        },
        purchaseOrderId: updated.dataValues.purchaseOrderId,
        productId: updated.dataValues.productId,
        rowId: req.params.id,
      });

      res.json(updated.dataValues);
    })
    .catch(async (e) => {
      const updated = await CustomerCustomProduct.findById(req.params.id);

      transferLog({
        req,
        productName: 'Regular Product',
        action: {
          UpdateRow: `Updated Unsuccesfully `,
        },
        otherDetail: {
          Status: 'UnDone',
          Error: `Error While updating customerCustomProducts ${e}`,
        },
        purchaseOrderId: updated.dataValues.purchaseOrderId,
        productId: updated.dataValues.productId,
        rowId: req.params.id,
      });
      console.log('error : ', e);
      res.status(422).json({ error: 'Error updating customer custom product' });
    });
});

router.get('/last_update', (req, res) => {
  CustomerCustomProduct.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"CustomerCustomProduct"."updatedAt" DESC'),
    limit: 1,
  })
    .then((customerCustomProducts) => {
      let lastUpdate = (customerCustomProducts[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

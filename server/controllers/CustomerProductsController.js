const { Router } = require('express');
const Sequelize = require('sequelize');
const { create: actionLogCreator } = require('../middleware/actionLogCreator');
const { create: transferLog } = require('../middleware/transferLog');

const {
  CustomerProduct,
  Lot,
  Product,
  ProductPackaging,
  Customer,
  CustomerMonsantoProduct,
  PurchaseOrder,
  Farm,
  SeedCompany,
} = require('models');
const router = (module.exports = Router({ mergeParams: true }));
const { filterDeletedListResponse } = require('utilities');

// TODO: even though this route is scoped to the customer id, it returns all for the organization
router.get('/', (req, res) => {
  CustomerProduct.all({
    where: {
      organizationId: req.user.organizationId,
    },
    include: [
      {
        model: Customer,
        where: {
          $or: [
            {
              isDeleted: false,
            },
            {
              isDeleted: null,
            },
          ],
        },
      },
      {
        model: Product,
        as: 'Product',
        include: [{ model: SeedCompany, as: 'SeedCompany' }],
      },
      {
        model: PurchaseOrder,
        as: 'PurchaseOrder',
      },
      {
        model: Farm,
        as: 'Farm',
      },
    ],
    // include: [
    //   {
    //     model: Product,
    //     // where: defaultSeasonWhere,
    //     include: [
    //       {
    //         model: ProductPackaging,
    //       },
    //     ],
    //   },
    // ],
  })
    .then(async (customerProducts) => {
      result = await Promise.all(
        customerProducts.map(async (customerProduct) => {
          let product = await Product.all({
            where: { id: customerProduct.toJSON().productId },
            include: [
              {
                model: ProductPackaging,
                where: {
                  purchaseOrderId: customerProduct.toJSON().purchaseOrderId,
                },
              },
            ],
          });
          return {
            ...customerProduct.toJSON(),
            Product: product[0],
          };
        }),
      );
      return res.json(filterDeletedListResponse(result));
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetchin customer products' });
    });
});

router.post('/', async (req, res) => {
  let customerId = req.params.customer_id;

  const organizationId = req.user.organizationId;
  let {
    purchaseOrderId,
    productId,
    quantity,
    discounts,
    farmId,
    packagingId,
    seedSizeId,
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
  CustomerProduct.all({
    where: {
      purchaseOrderId: purchaseOrderId,
      customerId: customerId,
      organizationId: organizationId,
      productId: productId,
    },
  }).then((customerProducts) => {
    let msrpEditedProduct = customerProducts.find((_customerProduct) => _customerProduct.msrpEdited != null);
    CustomerProduct.create({
      purchaseOrderId: purchaseOrderId,
      customerId: customerId,
      organizationId: organizationId,
      productId: productId,
      msrpEdited: msrpEditedProduct ? msrpEditedProduct.msrpEdited : null,
      orderQty: quantity,
      farmId: farmId ? farmId : null,
      packagingId,
      seedSizeId,
      discounts,
      fieldName,
      orderDate,
      comment,
      isReplant: po ? po.isReplant : false,
    })
      .then((customerProduct) => {
        transferLog({
          req,
          productName: 'Seed Product',
          action: {
            AddedNewRow: `Add new product with Quantity${quantity} `,
          },
          otherDetail: {
            Status: 'Added succesfully',
          },
          purchaseOrderId: purchaseOrderId,
          productId: productId,
          rowId: customerProduct.dataValues.id,
        });

        res.json(customerProduct);
      })
      .catch((e) => {
        transferLog({
          req,
          productName: 'Seed Product',
          action: {
            AddedNewRow: `Error While adding new customerProduct with Quantity${quantity} `,
          },
          otherDetail: {
            Status: 'Added Unsuccesfully',
            Error: `Error creating customerProduct product ${e}`,
          },
          purchaseOrderId: purchaseOrderId,
          productId: productId,
          rowId: null,
        });
        console.log(e);
        res.status(422).json({ error: 'Error creating customer product' });
      });
  });
});

router.patch('/:id', async (req, res) => {
  try {
    if (req.body.productId) {
      const customerProduct = await CustomerProduct.findById(req.params.id);
      if (!customerProduct) {
        return res.status(404).json({
          error: `Unable to find customer product with ID: ${req.params.id}`,
        });
      }
      let { amountDelivered } = req.body;

      if (amountDelivered) {
        // console.log("\ngot amount delivered : ", amountDelivered, "\n");
        EditLotQuantities(customerProduct.amountDelivered, amountDelivered);
      }
      await CustomerProduct.update(req.body, {
        where: { id: req.params.id },
      });

      if (req.body.msrpEdited) {
        CustomerProduct.all({
          where: {
            organizationId: customerProduct.organizationId,
            purchaseOrderId: customerProduct.purchaseOrderId,
            customerId: customerProduct.customerId,
            productId: customerProduct.productId,
          },
        }).then((customerProducts) => {
          customerProducts.forEach((_customerProduct) => {
            _customerProduct.update({ msrpEdited: req.body.msrpEdited });
          });
        });
      }

      let product = await Product.all({
        where: { id: customerProduct.toJSON().productId },
        include: [
          {
            model: ProductPackaging,
            where: {
              purchaseOrderId: customerProduct.toJSON().purchaseOrderId,
            },
          },
        ],
      });

      transferLog({
        req,
        productName: 'Seed Product',
        action: {
          UpdateRow: req.body.msrpEdited
            ? `Updated Succesfully with Quanity-${req.body.msrpEdited}`
            : `Update succesfully  `,
        },
        otherDetail: {
          Status: 'Done',
        },
        purchaseOrderId: customerProduct.dataValues.purchaseOrderId,
        productId: customerProduct.dataValues.productId,
        rowId: req.params.id,
      });
      res.status(200).json({
        ...customerProduct.toJSON(),
        Product: product[0],
      });
    } else if (req.body.CustomerProductId) {
      const customerProduct = await CustomerProduct.findById(req.params.id);
      if (!customerProduct) {
        return res.status(404).json({
          error: `Unable to find customer product with ID: ${req.params.id}`,
        });
      }
      delete req.body.CustomerProductId;
      await customerProduct.update(req.body);
      transferLog({
        req,
        productName: 'Seed Product',
        action: {
          UpdateRow: `Update succesfully `,
        },
        otherDetail: {
          Status: 'Done',
        },
        purchaseOrderId: customerProduct.dataValues.purchaseOrderId,
        productId: customerProduct.dataValues.productId,
        rowId: req.params.id,
      });
      res.status(200).json({
        ...customerProduct.toJSON(),
      });
    } else {
      const customerMonsantoProduct = await CustomerMonsantoProduct.findById(req.params.id);
      const customerProduct = await CustomerProduct.findById(req.params.id);
      const CustomerProductRes = req.body.isMonsantoPoruduct
        ? customerMonsantoProduct
        : req.body.monsantoProductId
        ? customerMonsantoProduct
        : customerProduct;
      const isMonsantoPoruduct = req.body.isMonsantoPoruduct ? true : false;
      if (!CustomerProductRes) {
        return res.status(404).json({
          error: `Unable to find customer product with ID: ${req.params.id}`,
        });
      }
      let { amountDelivered } = req.body;

      if (amountDelivered) {
        console.log('\ngot amount delivered : ', amountDelivered, '\n');
        EditLotQuantities(CustomerProductRes.amountDelivered, amountDelivered);
      }
      delete req.body.isMonsantoPoruduct;
      await CustomerProductRes.update(req.body);
      if (req.body.msrpEdited) {
        const query = {
          where: {
            organizationId: CustomerProductRes.organizationId,
            purchaseOrderId: CustomerProductRes.purchaseOrderId,
            // customerId: CustomerProductRes.customerId,
            productId: CustomerProductRes.productId,
            id: req.params.id,
          },
        };
        const allProducts = isMonsantoPoruduct ? CustomerMonsantoProduct.all(query) : CustomerProduct.all(query);
        allProducts.then((customerProducts) => {
          customerProducts.forEach((_customerProduct) => {
            _customerProduct.update({ msrpEdited: req.body.msrpEdited });
          });
        });
      }

      let product = await Product.all({
        where: { id: CustomerProductRes.toJSON().productId },
        include: [
          {
            model: ProductPackaging,
            where: {
              purchaseOrderId: CustomerProductRes.toJSON().purchaseOrderId,
            },
          },
        ],
      });

      transferLog({
        req,
        productName: 'Seed Product',
        action: {
          UpdateRow: `Updated succesfully `,
        },
        otherDetail: {
          Status: 'Done',
        },
        purchaseOrderId: CustomerProductRes.toJSON().purchaseOrderId,
        productId: CustomerProductRes.toJSON().productId,
        rowId: req.params.id,
      });
      res.status(200).json({
        ...CustomerProductRes.toJSON(),
        Product: product[0],
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: `Unable to edit customer product: ${err}` });
  }
});

router.delete('/:id', (req, res) => {
  let customerProductId = req.params.id;
  CustomerProduct.findById(customerProductId)
    .then((customerProduct) => customerProduct.destroy())
    .then((customerProduct) => {
      let previousData = {};

      transferLog({
        req,
        productName: 'Seed Product',
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
      actionLogCreator({
        req,
        operation: 'delete',
        type: 'product',
        previousData,
        changedData: req.body,
        typeId: req.params.id,
      });
      res.json({ ok: 'ok' });
    })
    .catch(async (e) => {
      // let customerProductId = req.params.id;
      // const customerProduct = await CustomerProduct.findById(customerProductId);
      // transferLog({
      //   req,
      //   productName: 'Seed Product',
      //   action: {
      //     DeleteRow: `Deleted Unsuccesfully `,
      //   },
      //   otherDetail: {
      //     Status: 'UnDone',
      //     Error: `Error While deleting customerProduct ${e}`,
      //   },
      //   purchaseOrderId: customerProduct.dataValues.purchaseOrderId,
      //   productId: customerProduct.dataValues.productId,
      //   rowId: req.params.id,
      // });
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting customer product' });
    });
});

function EditLotQuantities(customerProductDelivered, amountDelivered) {
  let prevDelivered = JSON.parse(customerProductDelivered);
  amountDelivered = JSON.parse(amountDelivered);
  amountDelivered.forEach((amount) => {
    Lot.find({ where: { id: amount.id } }).then((lot) => {
      console.log(typeof prevDelivered, prevDelivered, prevDelivered !== null);
      let prevAmount =
        prevDelivered !== null
          ? prevDelivered.find((delivered) => {
              return delivered.id === amount.id;
            })
          : { delivered: 0 };
      let diff = parseInt(prevAmount.delivered) - parseInt(amount.delivered);
      lot.quantity = lot.quantity + diff;
      console.log(diff, lot.quantity);
      lot.save();
    });
  });
}

router.get('/last_update', (req, res) => {
  CustomerProduct.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"CustomerProduct"."updatedAt" DESC'),
    limit: 1,
  })
    .then((customerProducts) => {
      let lastUpdate = (customerProducts[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

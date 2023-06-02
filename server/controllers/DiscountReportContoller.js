const { Router } = require('express');
const _ = require('lodash');
const authMiddleware = require('middleware/userAuth');
const { DiscountReport, DealerDiscount, PurchaseOrder, Customer } = require('models');

const router = (module.exports = Router().use(authMiddleware));

router.get('/', (req, res) => {
  DiscountReport.findAll({ where: { organizationId: req.user.organizationId } })
    .then((discountReports) => res.json(discountReports))
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetching discount packages' });
    });
});

router.get('/generateReport', async (req, res) => {
  const allDealerDiscount = await DealerDiscount.all({
    where: {
      organizationId: req.user.organizationId,
      isDeleted: false,
    },
    raw: true,
  });
  const allDiscountReport = await DiscountReport.all({
    where: { organizationId: req.user.organizationId, isDeleted: false },
    include: [
      {
        model: PurchaseOrder,
        where: {
          isDeleted: false,
        },

        attributes: ['name'],
        include: [
          {
            model: Customer,
            where: {
              isDeleted: false,
            },

            attributes: ['name'],
          },
        ],
      },
    ],
    raw: true,
  });
  const finalData = allDiscountReport.map((item) => {
    const dicountGroup = _.groupBy(item.discountJSON, 'discountId');

    let discountTotalObj = {};
    for (const [key, value] of Object.entries(dicountGroup)) {
      let discountSum = 0;
      value.map(async (innerItem) => {
        if (innerItem.DiscountSubtotal) {
          discountSum = discountSum + parseFloat(innerItem.DiscountSubtotal.replace('$', '').replace(',', ''));
        }
      });
      const dd = allDealerDiscount.find((item) => item.id === Number(key));

      if (dd) discountTotalObj[dd.name] = discountSum.toFixed(2);
    }

    return {
      Name: item['PurchaseOrder.Customer.name'],
      PurchaseOrder: item['PurchaseOrder.name'],
      PurchaseOrderNumber: item.purchaseOrderId,
      discountTotalObj,
    };
  });
  res.json(finalData);
});

router.post('/', async (req, res) => {
  const { purchaseOrderId } = req.body;
  const oldDiscountReport = await DiscountReport.findOne({
    where: { organizationId: req.user.organizationId, purchaseOrderId },
  });

  if (oldDiscountReport) {
    if (oldDiscountReport.isLoad) {
      oldDiscountReport
        .update({ ...req.body, isLoad: false })
        .then((newPackage) => res.json(newPackage))
        .catch((e) => {
          console.log('error : ', e);
          res.status(422).json({ error: 'Error creating discount package' });
        });
    } else {
      oldDiscountReport
        .update({ ...req.body, isLoad: false })
        .then((newPackage) => res.json(newPackage))
        .catch((e) => {
          console.log('error : ', e);
          res.status(422).json({ error: 'Error creating discount package' });
        });
    }
  } else {
    DiscountReport.create({
      ...req.body,
      organizationId: req.user.organizationId,
    })
      .then((newPackage) => res.json(newPackage))
      .catch((e) => {
        console.log('error : ', e);
        res.status(422).json({ error: 'Error creating discount package' });
      });
  }
});

router.delete('/:id', (req, res) => {
  DiscountReport.findById(req.params.id)
    .then((discountPackage) => discountPackage.destroy())
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting discount package' });
    });
});

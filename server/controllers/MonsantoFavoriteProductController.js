const { Router } = require('express');
const Sequelize = require('sequelize');

const { MonsantoFavoriteProduct, MonsantoProduct, MonsantoProductLineItem } = require('models');
const { filterDeletedListResponse } = require('utilities');

const router = (module.exports = Router({ mergeParams: true }));

// TODO: even though this route is scoped to the customer id, it returns all for the organization
router.get('/', (req, res, next) => {
  MonsantoFavoriteProduct.all({
    where: {},
    include: [
      {
        model: MonsantoProduct,
        attributes: [
          'id',
          'brand',
          'blend',
          'treatment',
          'classification',
          'seedSize',
          'packaging',
          'seedCompanyId',
          'crossReferenceId',
        ],
        as: 'Product',
        include: [
          {
            model: MonsantoProductLineItem,
            attributes: [
              'id',
              'suggestedDealerPrice',
              'suggestedDealerMeasurementUnitCode',
              'suggestedDealerMeasurementValue',
              'effectiveFrom',
              'effectiveTo',
            ],
            as: 'LineItem',
            // where: {
            //   $and: [
            //     {
            //       effectiveFrom: {
            //         $lte: new Date(),
            //       },
            //     },
            //     {
            //       effectiveTo: {
            //         $gte: new Date(),
            //       },
            //     },
            //   ],
            // },
          },
        ],
      },
    ],
  })
    .then((monsantoFavoriteProducts) => {
      res.json(filterDeletedListResponse(monsantoFavoriteProducts));
    })
    .catch((e) => {
      console.log(e);
      res.status(422).json({ error: 'Error fetchin bayer favorite products' });
    });
});

router.post('/', async (req, res, next) => {
  let { apiSeedCompanyId, products } = req.body;
  let result = [];
  try {
    result = await Promise.all(
      products.map(async (product) => {
        const favoriteProduct = await MonsantoFavoriteProduct.findOne({
          where: { productId: product.id, apiSeedCompanyId: apiSeedCompanyId },
        });
        if (favoriteProduct) return null;
        return await MonsantoFavoriteProduct.create({
          productId: product.id,
          apiSeedCompanyId: apiSeedCompanyId,
        });
      }),
    );
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: 'Error creating bayer favorite product' });
    console.log(err);
  }
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
  let monsantoFavoriteProductId = req.params.id;
  MonsantoFavoriteProduct.findById(monsantoFavoriteProductId)
    .then((monsantoFavoriteProduct) => monsantoFavoriteProduct.destroy())
    .then(() => res.json({ ok: 'ok' }))
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ error: 'Error deleting bayer favorite product' });
    });
});

router.get('/last_update', (req, res) => {
  MonsantoFavoriteProduct.all({
    where: {},
    order: Sequelize.literal('"MonsantoFavoriteProduct"."updatedAt" DESC'),
    limit: 1,
  })
    .then((MonsantoFavoriteProducts) => {
      let lastUpdate = (MonsantoFavoriteProducts[0] || {}).updatedAt;
      res.json({ lastUpdate });
    })
    .catch((e) => {
      console.log('error : ', e);
      res.status(422).json({ errors: 'Error getting last update' });
    });
});

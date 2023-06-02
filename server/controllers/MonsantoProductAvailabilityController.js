const request = require('request-promise');
const { check, validationResult } = require('express-validator/check');
const moment = require('moment');
const emailUtility = require('utilities/email');

const {
  ApiSeedCompany,
  MonsantoProduct,
  MonsantoProductLineItem,
  Organization,
  MonsantoRetailerOrderSummary,
  MonsantoRetailerOrderSummaryProduct,
  MonsantoProductBookingSummaryProducts,

  ...db
} = require('models');
const config = require('config').getConfig();
const {
  productAvailability: { buildProductAvailabilityRequest, parseProductAvailabilityResponse },
  common: { parseXmlStringPromise },
} = require('utilities/xml');
const { groupBy } = require('lodash');
const { parseMainProductBookingError } = require('../utilities/xml/common');

exports.check = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });

  const { CustomerMonsantoProducts } = req.body;
  const monsantoProducts = CustomerMonsantoProducts.map((monsantoProduct) => {
    return monsantoProduct.MonsantoProduct;
  });
  const productGroups = groupBy(monsantoProducts, (monsantoProduct) => {
    return monsantoProduct.seedCompanyId;
  });
  const { name: organizationName } = await req.user.getOrganizationInfo();
  Object.keys(productGroups).forEach(async (seedCompanyId) => {
    try {
      const productList = productGroups[seedCompanyId];
      const { technologyId: seedDealerMonsantoId } = await ApiSeedCompany.findOne({
        where: { id: seedCompanyId },
      });
      const monsantoUserData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });
      const productAvailabilityRequest = await buildProductAvailabilityRequest({
        seedDealerMonsantoId,
        organizationName,
        productList,
        monsantoUserData,
      });
      const xmlResponse = await request.post(config.monsantoEndPoint, {
        'content-type': 'text/plain',
        body: productAvailabilityRequest,
      });
      const parsedString = await parseXmlStringPromise(xmlResponse);
      const { availableProducts } = await parseProductAvailabilityResponse(parsedString);
      const data = checkAvailableProducts(CustomerMonsantoProducts, availableProducts);
      return res.json(data);
    } catch (e) {
      // console.log("e:", e);
      return res.status(500).json({
        error: 'Cannot check availability.',
      });
    }
  });

  function checkAvailableProducts(CustomerMonsantoProducts, availableProducts) {
    let notAvailableProducts = [],
      noEnoughQtyProducts = [];
    CustomerMonsantoProducts.forEach((customerMonsantoProduct) => {
      const { orderQty } = customerMonsantoProduct;
      const availableProduct = availableProducts.filter(
        (_availableProduct) =>
          _availableProduct.identifications['AGIIS-ProductID'] ===
          customerMonsantoProduct.MonsantoProduct.LineItem.crossReferenceProductId,
      )[0];
      if (!availableProduct) {
        notAvailableProducts.push(customerMonsantoProduct);
      } else {
        let availabilableQty = parseInt(availableProduct.quantity.value, 10);
        if (parseInt(orderQty, 10) > availabilableQty) {
          noEnoughQtyProducts.push(customerMonsantoProduct);
        }
      }
    });
    return { notAvailableProducts, noEnoughQtyProducts };
  }
};

exports.checkInOrder = async (req, res) => {
  try {
    const { id: organizationId } = await req.user.getOrganizationInfo();
    const { technologyId: seedDealerMonsantoId, name: organizationName } = await ApiSeedCompany.findOne({
      where: { organizationId },
    });
    const { productList } = req.body;
    const monsantoUserData = await ApiSeedCompany.findOne({ where: { organizationId: req.user.organizationId } });
    const productAvailabilityRequest = await buildProductAvailabilityRequest({
      seedDealerMonsantoId,
      organizationName,
      productList,
      monsantoUserData,
    });
    const xmlResponse = await request.post(config.monsantoEndPoint, {
      'content-type': 'text/plain',
      body: productAvailabilityRequest,
    });
    const parsedString = await parseXmlStringPromise(xmlResponse);
    const { availableProducts } = await parseProductAvailabilityResponse(parsedString);
    res.send(availableProducts);
  } catch (error) {
    if (error.response) {
      try {
        const errorXmL = await parseXmlStringPromise(error.response.body);
        // here exception parse for both retail order summary and product bookingsummary is same that is
        //  why the parseReatilOrderSummaryError is written there
        if (parseMainProductBookingError(errorXmL) === 'No data found') {
          res.status(200).json([]);
        }
      } catch (e) {
        res.status(500).json({ error: 'Something went wrong!' });
      }
    } else {
      console.log('error in checkInOrder.....: ', error);
      res.status(500).json({ error: 'Something went wrong!' });
    }
  }
};

exports.checkInInventory = async (req, res, next) => {
  const monsantoUserData = await ApiSeedCompany.findOne({
    where: { organizationId: req.user.organizationId },
  });

  const { technologyId: seedDealerMonsantoId } = monsantoUserData;

  const retailerSummarydata = await MonsantoRetailerOrderSummary.findOne({
    where: { buyerMonsantoId: seedDealerMonsantoId },
    raw: true,
  });
  console.log(retailerSummarydata.id, 'retailerSummarydata.id');
  const retailerSummaryProductdata = await MonsantoRetailerOrderSummaryProduct.findAll({
    where: { summaryId: retailerSummarydata.id },
    raw: true,
    attributes: ['productId'],
  });

  var retailerSummaryProductId = await retailerSummaryProductdata.map(function (item) {
    return item['productId'];
  });

  const allMonsantoProducts = await MonsantoProduct.findAll({
    where: { organizationId: req.user.organizationId },
    include: [
      {
        model: MonsantoProductLineItem,
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
      {
        model: ApiSeedCompany,
      },
    ],
  });

  //Check if quantity synced already today
  const monsantoProducts = allMonsantoProducts.filter((p) => retailerSummaryProductId.includes(p.id));
  // allMonsantoProducts.filter(
  //   (_monsantoProduct) =>
  //     moment(_monsantoProduct.syncQuantityDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD'),
  // );
  console.log(allMonsantoProducts.length, 'allMonsantoProducts');
  console.log(monsantoProducts.length, 'only retail order releted mp ');

  if (monsantoProducts.length < 1) return;

  //Slice the array
  let index = 0,
    maxIndex = monsantoProducts.length / 500;
  console.log(monsantoProducts.length, 'monsantoProducts');

  while (index < maxIndex) {
    try {
      let products = monsantoProducts.slice(
        index * 500,
        index * 500 + 500 < monsantoProducts.length - 1 ? index * 500 + 500 : monsantoProducts.length - 1,
      );
      const productGroups = groupBy(products, (product) => {
        return product.seedCompanyId;
      });
      const tempdd = Object.keys(productGroups);
      let emaildata = [];
      const { id: organizationId, name: organizationName } = await req.user.getOrganizationInfo();

      await Promise.all(
        tempdd.map(async (seedCompanyId) => {
          const productList = productGroups[seedCompanyId];

          const productAvailabilityRequest = await buildProductAvailabilityRequest({
            seedDealerMonsantoId,
            organizationName,
            productList,
            monsantoUserData,
          });
          const xmlResponse = await request.post(config.monsantoEndPoint, {
            'content-type': 'text/plain',
            body: productAvailabilityRequest,
          });
          const parsedString = await parseXmlStringPromise(xmlResponse);
          const { availableProducts } = await parseProductAvailabilityResponse(parsedString);
          console.log('buildProductAvailabilityRequest call success');
          // update quantity
          productList.forEach(async (product) => {
            const availableProduct = availableProducts.find(
              (_availableProduct) => _availableProduct.identifications['AGIIS-ProductID'] === product.crossReferenceId,
            );
            const isProduct = await MonsantoProduct.findOne({
              where: { id: product.id, organizationId: parseInt(productList[0].organizationId, 10) },
            });
            if (isProduct) {
              if (availableProduct) {
                await MonsantoProduct.update(
                  {
                    quantity: availableProduct.quantity.value,
                    syncQuantityDate: new Date(),
                  },
                  { where: { id: product.id, organizationId: req.user.organizationId } },
                );
              } else {
                await MonsantoProduct.update(
                  { quantity: 0, syncQuantityDate: new Date() },
                  { where: { id: product.id, organizationId: req.user.organizationId } },
                );
              }
            } else {
              emaildata.push({ crossReferenceId: product.crossReferenceId, productDetail: product.productDetail });
            }
          });
        }),
      ).then(() => {
        emaildata.length > 0 &&
          emailUtility.sendEmail(
            'dev@agridealer.co',
            'Product Not Found Email',
            `Below Product is not found in ProductAvailabilityRequest `,
            `<p>Below Product is not found in ProductAvailabilityRequest</p><br></br>${emaildata.map((data) => {
              return `<p>The product name/detail${
                data.productDetail ? data.productDetail : null
              } , the Bayer product ID ${data.crossReferenceId} , and the organizationId is ${
                req.user.organizationId
              }  </p>`;
            })}`,
            null,
          );
      });
    } catch (error) {
      console.log('error at index', index, 'error', error);
    }

    index++;
  }
  res.json('done');
};

exports.checkShortProduct = async (req, res) => {
  try {
    const shortProduct = [];
    let monsantoData = [];
    let sameTraitVarietyData = [];
    let productList = [];
    const { id: organizationId, name: organizationName } = await req.user.getOrganizationInfo();
    const { technologyId: seedDealerMonsantoId } = await ApiSeedCompany.findOne({
      where: { organizationId: organizationId },
    });
    console.log(seedDealerMonsantoId, 'seedDealerMonsantoId', organizationId, organizationName);
    const summary = await MonsantoRetailerOrderSummary.findOne({
      where: { buyerMonsantoId: seedDealerMonsantoId },
      raw: true,
    });

    const summuryProduct = await MonsantoRetailerOrderSummaryProduct.findAll({
      where: { summaryId: summary.id },
      raw: true,
    });

    let firstPromise = () => {
      return new Promise((resolve, reject) => {
        summuryProduct.map(async (sp) => {
          const MonsantoProductBookingSummaryData = await MonsantoProductBookingSummaryProducts.findOne({
            where: {
              productId: sp.productId,
            },
            raw: true,
          });

          if (
            MonsantoProductBookingSummaryData !== null &&
            MonsantoProductBookingSummaryData.productId == sp.productId
          ) {
            await shortProduct.push({
              shortValue:
                (sp.totalRetailerProductQuantityValue ? sp.totalRetailerProductQuantityValue : 0) -
                parseFloat(MonsantoProductBookingSummaryData.allGrowerQty, 10) +
                parseFloat(MonsantoProductBookingSummaryData.bayerDealerBucketQty, 10),
              productId: sp.productId,
            });
            return setTimeout(() => {
              resolve(shortProduct);
            }, 1000);
          }
        });
      });
    };

    Promise.all([firstPromise()]).then(async () => {
      console.log(shortProduct.length, 'shortproductLength');

      const promises = new Promise((resolve, reject) => {
        shortProduct.map(async (sp) => {
          const data = await MonsantoProduct.findOne({
            where: { id: sp.productId, organizationId: organizationId },
            include: [
              {
                model: MonsantoProductLineItem,
                as: 'LineItem',
                attributes: ['id', 'suggestedDealerMeasurementValue', 'suggestedDealerMeasurementUnitCode'],
              },
            ],
            raw: true,
          });

          monsantoData.push(data);
        });
        return setTimeout(() => {
          return resolve(monsantoData);
        }, 1500);
      });

      // await Promise.all([promises]).then(async () => {
      //   console.log(monsantoData.length, 'monsantoData');

      //   const promises = new Promise((resolve, reject) => {
      //     monsantoData
      //       .filter((sp) => sp !== null)
      //       .map(async (sp) => {
      //         const data = await MonsantoProduct.findAll({
      //           where: {
      //             blend: {
      //               [db.Sequelize.Op.iLike]: `%${sp.blend}%`,
      //             },
      //             brand: {
      //               [db.Sequelize.Op.iLike]: `%${sp.brand}%`,
      //             },
      //             organizationId: organizationId,
      //           },
      //           raw: true,
      //           include: [
      //             {
      //               model: MonsantoProductLineItem,
      //               as: 'LineItem',
      //               attributes: ['id', 'suggestedDealerMeasurementValue', 'suggestedDealerMeasurementUnitCode'],
      //             },
      //           ],
      //         });

      //         sameTraitVarietyData.push(data);
      //       });
      //     return setTimeout(() => {
      //       return resolve(sameTraitVarietyData);
      //     }, 3000);
      //   });

      await Promise.all([promises]).then(async () => {
        console.log(monsantoData.length, 'monsantoData');
        const promises = new Promise((resolve, reject) => {
          monsantoData.map((s) => {
            productList.push({
              crossReferenceId: s.crossReferenceId,
              classification: s.classification,
              blend: s.blend,
              brand: s.brand,
              id: s.id,
              LineItem: {
                suggestedDealerMeasurementValue: s['LineItem.suggestedDealerMeasurementValue'],
                suggestedDealerMeasurementUnitCode: s['LineItem.suggestedDealerMeasurementUnitCode'],
              },
            });
          });
          return setTimeout(() => {
            return resolve(productList);
          }, 3000);
        });

        await Promise.all([promises])
          .then(async () => {
            console.log(productList.length, 'productList---------');
            const makeUnique =
              productList.length > 0 &&
              productList.reduce((list, item) => {
                const hasItem = list.find((listItem) => ['blend', 'brand'].every((key) => listItem[key] === item[key]));
                if (!hasItem) list.push(item);
                return list;
              }, []);

            console.log(makeUnique.length, 'makeUnique-----');
            const monsantoUserData = await ApiSeedCompany.findOne({
              where: { organizationId: organizationId },
            });
            const productAvailabilityRequest = await buildProductAvailabilityRequest({
              seedDealerMonsantoId,
              organizationName,
              productList: makeUnique,
              monsantoUserData,
            });
            const xmlResponse = await request.post(config.monsantoEndPoint, {
              'content-type': 'text/plain',
              body: productAvailabilityRequest,
            });
            const parsedString = await parseXmlStringPromise(xmlResponse);

            const { availableProducts } = await parseProductAvailabilityResponse(parsedString);

            console.log(availableProducts.length, 'availableProducts');
            emailUtility
              .sendEmail(
                'dev@agridealer.co',
                'Short product  Request ',
                `Short Product list`,
                `<p><table style="border:1px solid black; border-collapse: collapse">
               <tr>
               <th  style="padding:10px">OrganizationId</th>
                <th  style="padding:10px">Brand</th>
                <th  style="padding:10px">Blend</th>
              
                <th  style="padding:10px">ShortValue</th>
                <th  style="padding:10px">CrossReferenceId</th>
                <th  style="padding:10px">AvailableProductsQty</th>
                </tr>
           
            ${shortProduct
              .filter((d) => d.shortValue < 0)
              .map((d) => {
                const p = monsantoData.filter((p) => p !== null && d.productId == p.id)[0];

                if (p) {
                  const isExit = availableProducts.filter(
                    (a) => a.identifications['AGIIS-ProductID'] == p.crossReferenceId,
                  );

                  return `<tr>  
                  <td style="text-align:center">${organizationId}</td>
                <td style="text-align:center">${p.brand}</td>
                <td style="text-align:center">${p.blend}</td>
             
                <td style="text-align:center">${d.shortValue}</td>
                <td style="text-align:center">${p.crossReferenceId}</td>
                 <td style="text-align:center">${isExit.length > 0 ? isExit[0].quantity.value : 0}</td>
               </tr>
     
            `;
                }
              })}
          
        </table>
            
            <p>`,
                null,
              )
              .then((response) => {
                console.log('done');
                // res.status(200).json({ success: true, message: 'Check your email,It send successfully' });
              })
              .catch((e) => {
                res.status(400).json({ error: e });
              });
            return res.send(availableProducts);
          })
          .catch(async (error) => {
            if (error.response) {
              const errorXmL = await parseXmlStringPromise(error.response.body);
              const errorString = parseMainProductBookingError(errorXmL);
              // here exception parse for both retail order summary and product bookingsummary is same that is
              //  why the parseReatilOrderSummaryError is written there

              if (parseMainProductBookingError(errorXmL) === 'No data found') {
                return res.status(200).json([]);
              }
              return res.status(503).json({ error: errorString || 'something wrong with the api for now!' });
            } else {
              console.log('error in checkShortProduct.....: ', error);
              return res.status(500).json({ error: 'Something went wrong!' });
            }
          });
      });
      // });
    });
  } catch (error) {
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      const errorString = parseMainProductBookingError(errorXmL);
      // here exception parse for both retail order summary and product bookingsummary is same that is
      //  why the parseReatilOrderSummaryError is written there

      if (parseMainProductBookingError(errorXmL) === 'No data found') {
        return res.status(200).json([]);
      }
      return res.status(503).json({ error: errorString || 'something wrong with the api for now!' });
    } else {
      console.log('error in checkInOrder.....: ', error);
      return res.status(500).json({ error: 'Something went wrong!' });
    }
  }
};

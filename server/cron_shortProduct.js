const request = require('request-promise');
const config = require('config').getConfig();
const emailUtility = require('utilities/email');

const CronJob = require('cron').CronJob;
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
const {
  productAvailability: { buildProductAvailabilityRequest, parseProductAvailabilityResponse },
  common: { parseXmlStringPromise },
} = require('utilities/xml');

const { parseMainProductBookingError } = require('utilities/xml/common');
const job = new CronJob(
  //"*/10 * * * * *",
  //   '*/200 * * * * *',
  //everyday
  // '0 0 * * *',
  '0 3 * * *', // run at 3AM every night

  // '*/30 * * * *', //run every 30 second
  async () => {
    try {
      // checkShortProduct();
    } catch (err) {
      console.log('err', err);
    }
  },
  null,
  true,
  'America/Chicago',
);

async function checkShortProduct() {
  ApiSeedCompany.findAll().then((apiSeedCompany) => {
    apiSeedCompany.forEach(async (apiSeedCompany, i) => {
      setTimeout(() => {
        checkShortProductFunction(apiSeedCompany.organizationId, apiSeedCompany.technologyId);
      }, 15000 * i);
    });
  });
}

const checkShortProductFunction = async (organizationId, technologyId) => {
  try {
    const shortProduct = [];
    let monsantoData = [];
    let sameTraitVarietyData = [];
    let productList = [];

    const apiData = await ApiSeedCompany.findOne({
      where: { organizationId: organizationId },
      raw: true,
    });
    const OrgData = await Organization.findOne({
      where: { id: organizationId },
      raw: true,
    });
    if (apiData) {
      const seedDealerMonsantoId = (apiData && apiData.technologyId) || technologyId;
      const organizationName = OrgData.name;

      console.log(seedDealerMonsantoId, 'seedDealerMonsantoId', organizationId, OrgData.name);

      // based on seedDealerMonsantoId get sumurry id for MonsanroReatilOrderSumurryproduct's
      const summary = await MonsantoRetailerOrderSummary.findOne({
        where: { buyerMonsantoId: seedDealerMonsantoId || technologyId },
        raw: true,
      });
      //Based on sumurry id get all product's
      const summuryProduct = await MonsantoRetailerOrderSummaryProduct.findAll({
        where: { summaryId: summary.id },
        raw: true,
      });

      console.log(summuryProduct.length, 'summuryProduct-1');

      let firstPromise = () => {
        return new Promise((resolve, reject) => {
          //monsantoReatilOrder productId match with PBSumurryproduct's and get the growerQty and bucketQty for getting short value of product
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
              const demand =
                parseFloat(MonsantoProductBookingSummaryData.allGrowerQty, 10) +
                parseFloat(MonsantoProductBookingSummaryData.bayerDealerBucketQty, 10);
              await shortProduct.push({
                shortValue:
                  Number(sp.totalRetailerProductQuantityValue ? sp.totalRetailerProductQuantityValue : 0) - demand,
                productId: MonsantoProductBookingSummaryData.productId,
              });
              return setTimeout(() => {
                resolve(shortProduct);
              }, 1000);
            }
          });
        });
      };

      Promise.all([firstPromise()]).then(async () => {
        console.log(shortProduct.length, 'shortproductLength-2');

        const promises = new Promise((resolve, reject) => {
          shortProduct.map(async (sp) => {
            const data = await MonsantoProduct.findOne({
              where: { id: sp.productId },
              raw: true,

              include: [
                {
                  model: MonsantoProductLineItem,
                  as: 'LineItem',
                  attributes: ['id', 'suggestedDealerMeasurementValue', 'suggestedDealerMeasurementUnitCode'],
                },
              ],
            });

            data !== null && monsantoData.push(data);
          });
          return setTimeout(() => {
            return resolve(monsantoData);
          }, 1000);
        });

        await Promise.all([promises]).then(async () => {
          console.log(monsantoData.length, 'monsantoData-3', organizationId);
          const promises = new Promise((resolve, reject) => {
            monsantoData.map((s) => {
              productList.push({
                crossReferenceId: s.crossReferenceId,
                classification: s.classification,
                blend: s.blend,
                brand: s.brand,
                LineItem: {
                  suggestedDealerMeasurementValue: s['LineItem.suggestedDealerMeasurementValue'],
                  suggestedDealerMeasurementUnitCode: s['LineItem.suggestedDealerMeasurementUnitCode'],
                },
              });
            });
            return setTimeout(() => {
              return resolve(productList);
            }, 5000);
          });

          await Promise.all([promises])
            .then(async () => {
              console.log(productList.length, 'productList-5');
              const makeUnique =
                productList.length > 0 &&
                productList.reduce((list, item) => {
                  const hasItem = list.find((listItem) =>
                    ['blend', 'brand'].every((key) => listItem[key] === item[key]),
                  );
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
              // return res.send(availableProducts);

              console.log(availableProducts.length, 'availableProducts from availiability product');
              emailUtility
                .sendEmail(
                  'support@agridealer.app',
                  'Short product  Request ',
                  `Short Product list`,
                  `<p><table style="border:1px solid black; border-collapse: collapse">
                 <tr>
                 <th style="padding:10px; border: 1px solid #dddddd">OrganizationId</th>
                 <th style="padding:15px; border: 1px solid #dddddd">Organization Email</th>

                <th style="padding:10px; border: 1px solid #dddddd">Brand</th>
                <th style="padding:10px; border: 1px solid #dddddd">Blend</th>
                <th style="padding:10px; border: 1px solid #dddddd">ShortValue</th>
                <th style="padding:10px; border: 1px solid #dddddd">CrossReferenceId</th>
                <th style="padding:10px; border: 1px solid #dddddd">AvailableProductsQty</th>
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
                  <td style="text-align:center;border: 1px solid #dddddd">${organizationId}</td>
                  <td style="text-align:center;border: 1px solid #dddddd">${OrgData.email}</td>
          <td style="text-align:center;border: 1px solid #dddddd">${p.brand}</td>
                  <td style="text-align:center;border: 1px solid #dddddd">${p.blend}</td>
                  <td style="text-align:center;border: 1px solid #dddddd">${d.shortValue}</td>
                  <td style="text-align:center;border: 1px solid #dddddd">${p.crossReferenceId}</td>
                   <td style="text-align:center;border: 1px solid #dddddd">${
                     isExit.length > 0 ? isExit[0].quantity.value : 0
                   }</td>
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
                })
                .catch((e) => {
                  res.status(400).json({ error: e });
                });
            })
            .catch(async (error) => {
              if (error.response) {
                const errorXmL = await parseXmlStringPromise(error.response.body);
                const errorString = parseMainProductBookingError(errorXmL);

                console.log(errorString);
              } else {
                console.log('error in checkShortProduct.....: ', error);
              }
            });
        });
      });
    } else {
      console.log('bayer data not found');
    }
  } catch (error) {
    if (error.response) {
      const errorXmL = await parseXmlStringPromise(error.response.body);
      const errorString = parseMainProductBookingError(errorXmL);

      console.log(errorString);
    } else {
      console.log('error in checkShortProduct.....: ', error);
    }
  }
};

process.env.IS_CRON_RUN === 'true' && job.start();

module.exports = { job, checkShortProduct };

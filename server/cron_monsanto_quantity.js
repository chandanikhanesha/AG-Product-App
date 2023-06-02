// create statement automaticlly
const moment = require('moment');
const config = require('config').getConfig();
const emailUtility = require('utilities/email');

const request = require('request-promise');
const {
  productAvailability: { buildProductAvailabilityRequest, parseProductAvailabilityResponse },
  common: { parseXmlStringPromise },
} = require('utilities/xml');
const { groupBy } = require('lodash');
const CronJob = require('cron').CronJob;
const {
  Organization,
  ApiSeedCompany,
  MonsantoProduct,
  MonsantoProductLineItem,
  MonsantoRetailerOrderSummaryProduct,
} = require('models');

const job = new CronJob(
  //"*/10 * * * * *",
  //everyday
  '0 0 */2 * * * ',
  // '* * * * *',
  async () => {
    try {
      // checkMonsantoProductsQuantity();
    } catch (err) {}
  },
  null,
  true,
  'America/Chicago',
);

async function checkMonsantoProductsQuantity() {
  try {
    console.log('Start check bayer product quantity job');
    //Get all bayer products
    const allMonsantoProducts = await MonsantoProduct.findAll({
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

    const monsantoProducts = allMonsantoProducts.filter(
      (_monsantoProduct) =>
        _monsantoProduct.crossReferenceId !== null &&
        moment(_monsantoProduct.syncQuantityDate).format('YYYY-MM-DD') !== moment().format('YYYY-MM-DD'),
    );
    if (monsantoProducts.length < 1) return;

    const organizations = await Organization.findAll();
    let emailDataProduct = [];
    //Slice the array
    let index = 0,
      maxIndex = monsantoProducts.length / 500;
    while (index < maxIndex) {
      let products = monsantoProducts.slice(
        index * 500,
        index * 500 + 500 < monsantoProducts.length - 1 ? index * 500 + 500 : monsantoProducts.length - 1,
      );
      const productGroups = groupBy(products, (product) => {
        return product.seedCompanyId;
      });
      Object.keys(productGroups).forEach(async (seedCompanyId) => {
        try {
          const productList = productGroups[seedCompanyId];
          const organization = await organizations.find(
            (_organization) => _organization.id === parseInt(productList[0].organizationId, 10),
          );
          const { name: organizationName } = organization;
          const { technologyId: seedDealerMonsantoId } = productList[0].ApiSeedCompany;
          const monsantoUserData = await ApiSeedCompany.findOne({
            where: { organizationId: parseInt(productList[0].organizationId, 10) },
          });
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
          let emaildata = [];
          // update quantity
          await Promise.all(
            productList.forEach(async (product) => {
              const availableProduct = availableProducts.find(
                (_availableProduct) =>
                  _availableProduct.identifications['AGIIS-ProductID'] === product.crossReferenceId,
              );
              const isProduct = await MonsantoProduct.findOne({
                where: { id: product.id, organizationId: parseInt(productList[0].organizationId, 10) },
              });

              const monsantoRetailSummuryData = await MonsantoRetailerOrderSummaryProduct.findOne({
                where: { productId: product.id },
                raw: true,
              });

              if (isProduct) {
                if (availableProduct) {
                  await MonsantoProduct.update(
                    {
                      quantity: availableProduct.quantity.value,
                      syncQuantityDate: new Date(),
                    },
                    { where: { id: product.id, organizationId: parseInt(productList[0].organizationId, 10) } },
                  );
                  emailDataProduct.push({
                    AGIISProductId: availableProduct.identifications['AGIIS - ProductID'],
                    availbleQunaity: availableProduct.quantity.value,
                  });
                } else {
                  await MonsantoProduct.update(
                    {
                      quantity: 0,
                      syncQuantityDate: new Date(),
                    },
                    { where: { id: product.id, organizationId: parseInt(productList[0].organizationId, 10) } },
                  );
                }
              } else {
                emaildata.push({ crossReferenceId: product.crossReferenceId, productDetail: product.productDetail });
              }
            }),
          ).then(() => {
            emaildata.length < 0 &&
              emailUtility.sendEmail(
                'support@agridealer.app',
                'Product Not Found Email',
                `Below Product is not found in cron job of ProductAvailabilityRequest `,
                `<p>Below Product is not found in ProductAvailabilityRequest</p><br></br>${emaildata.map((data) => {
                  return `<p>The product name/detail${data.productDetail} , the Bayer product ID ${
                    data.crossReferenceId
                  } , and the  organizationId is ${parseInt(productList[0].organizationId)}  </p>`;
                })}`,
                null,
              );

            console.log(emailDataProduct, 'emailDataProduct');
            emailDataProduct.length > 0 &&
              emailUtility.sendEmail(
                'support@agridealer.app',
                'Product Availability',
                `Below Product is Available  `,
                `<p>Below Product is Available</p><br></br>${emailDataProduct.map((data) => {
                  return `<p>The AGIISProductId ${data.AGIISProductId} , the product Quantity value is ${
                    data.availbleQunaity
                  } , and the  organizationId is ${parseInt(productList[0].organizationId)}  </p>`;
                })}`,
                null,
              );
          });

          // res.json(data);
        } catch (err) {
          // console.log(`err from not availble product ${err}`);
        }
      });
      index++;
    }
  } catch (err) {
    console.log(`err from cron_monsanto_quanity  ${err}`);
  }
  console.log('check bayer quantity job done');
}

process.env.IS_CRON_RUN === 'true' && job.start();

module.exports = { job, checkMonsantoProductsQuantity };

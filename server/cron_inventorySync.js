const request = require('request-promise');
const config = require('config').getConfig();
const { syncSummaryData } = require('./controllers/MonsantoRetailOrdersController');
const { syncProductBookingSummary } = require('./controllers/MonsantoSyncController');
const CronJob = require('cron').CronJob;
const { groupBy } = require('lodash');
const emailUtility = require('utilities/email');

const {
  ApiSeedCompany,
  MonsantoProduct,
  MonsantoProductLineItem,
  Organization,
  MonsantoRetailerOrderSummary,
  MonsantoRetailerOrderSummaryProduct,
  MonsantoProductBookingSummaryProducts,
  User,
  ...db
} = require('models');
const {
  productAvailability: { buildProductAvailabilityRequest, parseProductAvailabilityResponse },
  common: { parseXmlStringPromise, parseRetailOrderSummaryError },
  retailOrder: { buildRetailOrderSummaryRequest, parseRetailOrderSummaryResponse },
  productBookingSummary: { buildProductBookingSummaryRequest, parseProductBookingSummaryResponse },
} = require('utilities/xml');

const { parseMainProductBookingError } = require('utilities/xml/common');
const job = new CronJob(
  //"*/10 * * * * *",
  //   '*/200 * * * * *',
  //everyday
  // '0 0 * * *',
  '0 2 * * *', // run at 2AM every night

  async () => {
    try {
      syncInventory();
    } catch (err) {
      console.log('err', err);
    }
  },
  null,
  true,
  'America/Chicago',
);

async function syncInventory() {
  console.log('helllo function of sync inventory');
  ApiSeedCompany.findAll().then((apiSeedCompany) => {
    apiSeedCompany.map(async (apiSeedCompany, i) => {
      setTimeout(async () => {
        const organization = await Organization.findOne({
          where: {
            id: apiSeedCompany.organizationId,
          },
          raw: true,
        });

        const user = await User.findOne({ where: { email: organization.email } });
        if (user) {
          syncInventoryData(apiSeedCompany, organization, user);
        }
      }, 100000 * i);
    });
  });
}

const checkInInventory = async (organizationId) => {
  const monsantoUserData = await ApiSeedCompany.findOne({
    where: { organizationId: organizationId },
  });

  const { technologyId: seedDealerMonsantoId } = monsantoUserData;

  const retailerSummarydata = await MonsantoRetailerOrderSummary.findOne({
    where: { buyerMonsantoId: seedDealerMonsantoId },
    raw: true,
  });

  if (retailerSummarydata) {
    const retailerSummaryProductdata = await MonsantoRetailerOrderSummaryProduct.findAll({
      where: { summaryId: retailerSummarydata.id },
      raw: true,
      attributes: ['productId'],
    });

    const retailerSummaryProductId = await retailerSummaryProductdata.map(function (item) {
      return item['productId'];
    });
    const allMonsantoProducts = await MonsantoProduct.findAll({
      where: { organizationId: organizationId },
      include: [
        {
          model: MonsantoProductLineItem,
          as: 'LineItem',
          where: {
            $and: [
              {
                effectiveFrom: {
                  $lte: new Date(),
                },
              },
              {
                effectiveTo: {
                  $gte: new Date(),
                },
              },
            ],
          },
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
    if (monsantoProducts.length < 1) return;

    const organization = await Organization.findOne({
      where: { id: organizationId },
    });

    const { name: organizationName } = organization;

    //Slice the array
    let index = 0,
      maxIndex = monsantoProducts.length / 500;

    console.log(monsantoProducts.length, 'in checkInventory');
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
                (_availableProduct) =>
                  _availableProduct.identifications['AGIIS-ProductID'] === product.crossReferenceId,
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
                    { where: { id: product.id, organizationId: organizationId } },
                  );
                } else {
                  await MonsantoProduct.update(
                    { quantity: 0, syncQuantityDate: new Date() },
                    { where: { id: product.id, organizationId: organizationId } },
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
                } , the Bayer product ID ${data.crossReferenceId} , and the organizationId is ${organizationId}  </p>`;
              })}`,
              null,
            );
        });
      } catch (error) {
        console.log('error at index', index, 'error', error);
        emailUtility.sendEmail(
          'support@agridealer.app',
          'syncInventory cron job fail for ProductAvailabilityRequest ',
          `SyncInventory fail for  organizationId-${organization.id}-${organization.name} and error was ${error}`,
          null,
          null,
        );
      }

      index++;
    }
  }
};

const syncInventoryData = async (apiSeedCompany, organization, user) => {
  try {
    await Promise.all([
      syncSummaryData({ seedCompanyId: apiSeedCompany.id, user: user }),
      syncProductBookingSummary({ seedCompanyId: apiSeedCompany.id, user: user, organizationId: organization.id }),
      checkInInventory(organization.id),
    ]);
  } catch (error) {
    console.log('error in syncInventory.....: ', error);
    emailUtility.sendEmail(
      'support@agridealer.app',
      'syncInventory cron job fail ',
      `SyncInventory fail for ${organization.id}-${organization.name} and error was ${error}`,
      null,
      null,
    );
  }
};

process.env.IS_CRON_RUN === 'true' && job.start();

module.exports = { job, syncInventory };

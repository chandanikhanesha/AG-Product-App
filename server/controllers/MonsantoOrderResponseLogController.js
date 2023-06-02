const request = require('request-promise');
const { check, validationResult } = require('express-validator/check');
const Sequelize = require('sequelize');
const { ApiSeedCompany, MonsantoOrderResponseLog, MonsantoProduct } = require('models');
const config = require('config').getConfig();
const {
  orderResponseLog: { buildOrderResponseLogRequest, parseOrderResponseLogResponse },
  common: { parseXmlStringPromise },
} = require('utilities/xml');
const { calculateSeedYear } = require('../utilities/xml/common');

/*
Request Sample:
{
  "dateRange":{
    from: "2018-09-01T00:00:00Z",
    to: "2019-08-31T00:00:00Z"
  },
  "productYear": "2019"
}
*/

module.exports.list = async (req, res, next) => {
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) return res.status(422).json({ errors: 'Not all parameters present' });
  // const { from, to, productYear = new Date().getUTCFullYear(), seedCompanyId } = req.query;

  const checkExisting = await MonsantoOrderResponseLog.all({
    where: { organizationId: req.user.organizationId },
    order: Sequelize.literal('"MonsantoOrderResponseLog"."updatedAt" DESC'),
    limit: 1,
  });
  let x = new Date(`${calculateSeedYear() - 1}/08/01`).toISOString().split('Z');

  if (checkExisting.length > 0) {
    x = new Date(checkExisting[0].dataValues.updatedAt).toISOString().split('Z');
  }

  const y = new Date().toISOString().split('Z');
  const y1 = y[0].split('.');
  const from = y1[0] + '-05:00';

  const x1 = x[0].split('.');
  const to = x1[0] + '-05:00';

  const { name: organizationName } = await req.user.getOrganizationInfo();
  const monsantoUserData = await ApiSeedCompany.findOne({
    where: { organizationId: req.user.organizationId },
  });
  return buildOrderResponseLogRequest({
    from,
    to,
    productYear: calculateSeedYear(),
    organizationName,
    seedDealerMonsantoId: monsantoUserData.dataValues.technologyId,
    monsantoUserData,
  })
    .then((xmlStringRequest) =>
      request.post(config.monsantoEndPoint, {
        'content-type': 'text/plain',
        body: xmlStringRequest,
      }),
    )
    .then(parseXmlStringPromise)
    .then(parseOrderResponseLogResponse)
    .then((parsedResponse) => {
      const { products } = parsedResponse;
      products.forEach((product) => {
        const { changeIndicator, increaseOrDecrease, identification, increaseDecreaseDateTime, soldTo } = product;
        MonsantoProduct.findOne({
          where: {
            crossReferenceId: identification.identifier.id,
            organizationId: req.user.organizationId,
          },
        }).then((res) => {
          MonsantoOrderResponseLog.create({
            quantity: increaseOrDecrease.quantityChange.value,
            increaseDecrease: increaseOrDecrease.type,
            organizationId: req.user.organizationId,
            comments: changeIndicator.comments,
            crossReferenceId: identification.identifier.id,
            monsantoProductId: res ? res.dataValues.id : null,
            soldTo: soldTo.name,
            increaseDecreaseDateTime: increaseDecreaseDateTime,
          });
        });
      });
      res.json(parsedResponse);
    })
    .catch((e) => {
      console.log((e.response && e.response.body) || e); //TODO: parse error xml responses
      res.status(503).json({ error: 'Something happened when processing your request' });
    });
};

module.exports.listAll = async (req, res) => {
  MonsantoOrderResponseLog.findAll({
    where: { organizationId: req.user.organizationId },
    include: [
      {
        model: MonsantoProduct,
        as: 'Product',
      },
    ],
  })
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: 'Something went wrong!' });
    });
};

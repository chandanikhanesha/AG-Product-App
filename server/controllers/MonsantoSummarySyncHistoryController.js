const request = require('request-promise');
const { check, validationResult } = require('express-validator/check');
const { MonsantoSummarySyncHistory, MonsantoProduct, MonsantoProductBookingSummaryProducts } = require('models');
const config = require('config').getConfig();

module.exports.list = async (req, res) => {
  MonsantoSummarySyncHistory.findAll({
    where: { organizationId: req.user.organizationId },
    include: [
      {
        model: MonsantoProduct,
        as: 'Product',
      },
    ],
  })
    .then((response) => {
      //   console.log(response);
      res.send(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: 'Something went wrong!' });
    });
};

module.exports.updateIsChange = async (req, res) => {
  MonsantoProductBookingSummaryProducts.update(
    { isChanged: false },
    { where: { organizationId: req.user.organizationId } },
  )
    .then((response) => {
      //   console.log(response);
      res.send(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ err: 'Something went wrong!' });
    });
};

const { MonsantoCurrency } = require('models');

module.exports = async () => {
  return MonsantoCurrency.create({
    domain: 'ISO-4217',
    code: 'USD',
  });
};

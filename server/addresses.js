const models = require('./models');
const fs = require('fs');

async function go() {
  const customers = await models.Customer.all();

  customers.forEach((customer) => {
    if (customer.deliveryAddress === '') return;
    customer.update({
      businessStreet: customer.deliveryAddress,
      deliveryAddress: '',
    });
  });

  return;
}

go();

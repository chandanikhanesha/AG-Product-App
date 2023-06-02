/*
 * insert customers from customers.json file
 */
const { Customer } = require('models');
const customers = require('./customers.json');

module.exports = async () => {
  console.log('\nseeding customers...\n');

  const insertPromises = customers.map((c) => {
    const customer = new Customer();
    customer.organizationId = 1;
    customer.name = `${c.firstName} ${c.lastName}`;
    customer.businessAddress = `${c.address_1}, ${c.address_2}`;
    customer.monsantoTechnologyId = c.monsantoTechnologyId;
    const order = {
      products: c.order,
      orderDate: c.orderDate,
      orderNumber: c.orderNumber,
      accountNumber: c.accountNumber,
    };
    customer.purchaseOrderTmp = order;
    return customer.save();
  });
  return Promise.all(insertPromises);
};

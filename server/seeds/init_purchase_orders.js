/*
 * Creates an initial / default purchase order for every user
 */
const { Customer, PurchaseOrder, CustomerProduct, CustomerCustomProduct } = require('models');

module.exports = async () => {
  console.log('\nseeding purchase orders...\n');

  return Customer.all().then((customers) => {
    return Promise.all(
      customers.map((customer) => {
        return PurchaseOrder.create({
          id: Math.floor(1000000 + Math.random() * 900000),
          customerId: customer.id,
          organizationId: 1,
          name: `${customer.name} purchase order`,
        }).then((purchaseOrder) => {
          return Promise.all([
            CustomerProduct.update({ purchaseOrderId: purchaseOrder.id }, { where: { customerId: customer.id } }),
            CustomerCustomProduct.update({ purchaseOrderId: purchaseOrder.id }, { where: { customerId: customer.id } }),
          ]);
        });
      }),
    );
  });
};

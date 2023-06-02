const { Customer, PurchaseOrder, CustomerProduct } = require('models');

module.exports = async () => {
  console.log('\nseeding quotes...\n');

  return Customer.all()
    .then((customers) => {
      return Promise.all(
        customers.map((customer) => {
          return PurchaseOrder.create({
            id: Math.floor(1000000 + Math.random() * 900000),
            customerId: customer.id,
            organizationId: 1,
            name: `${customer.name} init quote`,
            isQuote: true,
          }).then((purchaseOrder) => {
            return CustomerProduct.create({
              productId: 1,
              purchaseOrderId: purchaseOrder.id,
              orderQty: 27,
              customerId: customer.id,
            });
          });
        }),
      );
    })
    .catch((e) => console.log(new Error(e)));
};

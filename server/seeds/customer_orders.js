/*
 * Create CustomerProduct join table items
 */
const { Product, Customer, CustomerProduct } = require('models');
const customers = require('./customers.json');

module.exports = async () => {
  console.log('\nseeding customer orders...\n');

  return Promise.all(
    customers.map((customer) => {
      return Customer.findOne({ where: { name: `${customer.firstName} ${customer.lastName}`, isArchive: false } }).then(
        (databaseCustomer) => {
          return Promise.all(
            customer.order.map((o) => {
              let split = o.product.split(' ');
              if (o.product.startsWith('AG')) {
                let where = {
                  brand: split[1],
                  blend: split[0],
                  amountPerBag: split[2],
                  treatment: split[3],
                };
                return Product.all({ where }).then((products) => {
                  if (products.length === 1) {
                    return CustomerProduct.create({
                      customerId: databaseCustomer.id,
                      productId: products[0].id,
                      orderQty: o.orderQty,
                      organizationId: 1,
                    });
                  }
                });
              } else if (o.product.startsWith('DKS')) {
                let where = {
                  blend: split[0],
                  // seedSize: split[1],
                  treatment: split[2],
                };
                return Product.all({ where }).then((products) => {
                  if (products.length === 1) {
                    return CustomerProduct.create({
                      customerId: databaseCustomer.id,
                      productId: products[0].id,
                      orderQty: o.orderQty,
                      organizationId: 1,
                      seedSize: split[1],
                    });
                  }
                });
              } else if (o.product.startsWith('DKC')) {
                let where = {
                  blend: split[0],
                  // seedSize: split[1],
                  brand: split[2],
                  amountPerBag: split[3],
                  treatment: split[4],
                };
                return Product.all({ where }).then((products) => {
                  if (products.length === 1) {
                    return CustomerProduct.create({
                      customerId: databaseCustomer.id,
                      productId: products[0].id,
                      orderQty: o.orderQty,
                      organizationId: 1,
                      seedSize: split[1],
                    });
                  }
                });
              }
            }),
          );
        },
      );
    }),
  );
};

(async () => {
  await require('seeds/create_organization_and_user')();
  await require('seeds/customers')();
  await require('seeds/grower_orders')();
  // await require("seeds/lot_numbers")();
  await require('seeds/customer_orders')();
  await require('seeds/init_purchase_orders')();
  await require('seeds/init_quotes')();
  await require('seeds/init_packaging')();
  await require('seeds/add_seed_company')();
  console.log('\nseed complete!');
})();

(async () => {
  await require('seeds/add_api_seed_company')();
  // try {
  //   await require("./seeds/add_monsanto_currencies")();
  //   await require("./seeds/add_monsanto_measures")();
  //   await require("./seeds/add_monsanto_products")();
  //   await require("./seeds/add_monsanto_bookings")();
  // } catch(e){
  //   console.log(e)
  // }

  //await require("./seeds/grower_orders")();
  // await require("./seeds/lot_numbers")();
  //await require("./seeds/customer_orders")();
  //await require("./seeds/init_purchase_orders")();
  //await require("./seeds/init_quotes")();
  //await require("./seeds/init_packaging")();

  console.log('\nbayer seed complete!');
})();

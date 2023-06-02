/*
 * Insert grower orders from json file
 */

const { Product } = require('models');
const dealerOrders = require('./growerOrders.json');

module.exports = async () => {
  console.log('\nseeding grower orders...\n');

  let seedTypes = Object.keys(dealerOrders);
  let things = [];

  seedTypes.forEach((seedType) => {
    let blends = Object.keys(dealerOrders[seedType]);

    blends.forEach((blend) => {
      let items = dealerOrders[seedType][blend];

      items.forEach((item) => {
        let thing = { seedType, blend };
        thing.organizationId = 1;
        thing.companyId = 1;
        thing.quantity = item.dealerOrder.split('   ')[0];
        thing.msrp = Math.floor(Math.random() * (400 - 250 + 1)) + 250;
        let name = item.name.split('\n')[0].split('(')[0];
        let split = name.split(' ');

        // skip this one: 'AG28X7 RR2X 140M UNTR(BAG)', doesn't have brand
        if (seedType === 'SOYBEAN' && split[2].match(/[0-9]{2,3}M$/)) return;

        switch (seedType) {
          case 'CORN':
            if (blend.includes('RIB')) {
              // thing.seedSize = split[1]
              thing.brand = split[2];
              thing.treatment = split[4];
              thing.amountPerBag = split[3];
            } else {
              // thing.seedSize = split[1]
              thing.brand = 'Conventional';
              thing.treatment = split[3];
              thing.amountPerBag = split[2];
            }
            break;
          case 'SORGHUM':
            // thing.seedSize = split[1]
            thing.treatment = split[2];
            break;
          case 'SOYBEAN':
            thing.brand = split[1];
            thing.blend = split[0];
            thing.amountPerBag = split[2];
            thing.treatment = split[3];
            break;
          default:
            return;
        }

        things.push(thing);
      });
    });
  });

  return Promise.all(things.map((thing) => new Product(thing).save()));
};

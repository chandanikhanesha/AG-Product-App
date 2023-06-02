const fs = require('fs');
const { DealerDiscount } = require('./models');

const go = async () => {
  const dealerDiscounts = await DealerDiscount.all();
  const dealerDiscountMap = {};
  dealerDiscounts.forEach((dealerDiscount) => {
    dealerDiscountMap[dealerDiscount.id] = {
      seedCompanyId: dealerDiscount.seedCompanyId,
      productCategories: dealerDiscount.productCategories,
    };
  });

  fs.writeFile('dealer_discounts.json', JSON.stringify(dealerDiscountMap), (err) => {
    if (err) return console.log('err : ', err);
    console.log('done');
  });
};

go();

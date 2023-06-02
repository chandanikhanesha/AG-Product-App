const { DealerDiscount } = require('./models');
const dealerDiscountsMap = require('./dealer_discounts.json');

const go = async () => {
  let dealerDiscountIds = Object.keys(dealerDiscountsMap);
  for (let i = 0; i < dealerDiscountIds.length; ++i) {
    const dealerDiscountId = dealerDiscountIds[i];

    await DealerDiscount.update(
      {
        seedCompanyIds: [dealerDiscountsMap[dealerDiscountId].seedCompanyId],
        productCategories: {
          [dealerDiscountsMap[dealerDiscountId].seedCompanyId]: dealerDiscountsMap[dealerDiscountId].productCategories,
        },
      },
      {
        where: { id: dealerDiscountId },
      },
    );
  }
  console.log('done');
};

go();

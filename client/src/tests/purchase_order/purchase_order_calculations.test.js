import { applyDiscounts } from '../../utilities';
import {
  quantityDiscount,
  dollarVolumeDiscount,
  earlyPayDiscount,
  flatAmountDiscount,
  cornProduct,
  customerProduct,
  getDateWithDaysOffset,
} from './setup/data';
// const dealerDiscounts = [quantityDiscount, dollarVolumeDiscount, earlyPayDiscount, flatAmountDiscount]

describe('Per total discounts', () => {
  describe('Flat Amount Discount', () => {
    it('should subtract the flat amount from the msrp', () => {
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        discounts: [{ order: 0, DiscountId: flatAmountDiscount.id }],
      });
      let returnedMsrp = applyDiscounts(data, 400, [flatAmountDiscount], cornProduct, cp);

      expect(data.discounts[flatAmountDiscount.id].value).toEqual('$307');
      expect(returnedMsrp).toEqual(93);
    });

    it('with a date past the lastDate, should not apply the discount', () => {
      const futureDate = getDateWithDaysOffset(2);
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        discounts: [{ order: 0, DiscountId: flatAmountDiscount.id }],
        orderDate: futureDate,
      });
      let returnedMsrp = applyDiscounts(data, 400, [flatAmountDiscount], cornProduct, cp);

      expect(data.discounts[flatAmountDiscount.id]).toEqual(undefined);
      expect(returnedMsrp).toEqual(400);
    });
  });

  describe('Dollar Volume Discount', () => {
    it('with an order between 1 and 100 should use the first discount detail', () => {
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        discounts: [{ order: 0, DiscountId: dollarVolumeDiscount.id }],
      });

      let returnedMsrp = applyDiscounts(data, 90, [dollarVolumeDiscount], cornProduct, cp);

      expect(data.discounts[dollarVolumeDiscount.id].value).toEqual('$20');
      expect(returnedMsrp).toEqual(70);
    });

    it('with an order between 101 and 200 should use the second discount detail', () => {
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        discounts: [{ order: 0, DiscountId: dollarVolumeDiscount.id }],
      });

      let returnedMsrp = applyDiscounts(data, 180, [dollarVolumeDiscount], cornProduct, cp);

      expect(data.discounts[dollarVolumeDiscount.id].value).toEqual('$30');
      expect(returnedMsrp).toEqual(150);
    });

    it('with an order between 201 and 300 should use the third discount detail', () => {
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        discounts: [{ order: 0, DiscountId: dollarVolumeDiscount.id }],
      });

      let returnedMsrp = applyDiscounts(data, 270, [dollarVolumeDiscount], cornProduct, cp);

      expect(data.discounts[dollarVolumeDiscount.id].value).toEqual('15%');
      expect(returnedMsrp).toEqual(270 - 270 * 0.15);
    });

    it('with an date past the last date should not apply the discount', () => {
      const futureDate = getDateWithDaysOffset(2);
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        discounts: [{ order: 0, DiscountId: dollarVolumeDiscount.id }],
        orderDate: futureDate,
      });

      let returnedMsrp = applyDiscounts(data, 270, [dollarVolumeDiscount], cornProduct, cp);

      expect(data.discounts[dollarVolumeDiscount.id]).toEqual(undefined);
      expect(returnedMsrp).toEqual(270);
    });
  });
});

describe('Per bag discounts', () => {
  describe('Early Pay Discount', () => {
    it('with an order total of 100 should NOT use the first detail because the date has passed', () => {
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        orderQty: 1,
        discounts: [{ order: 0, DiscountId: earlyPayDiscount.id }],
        orderDate: getDateWithDaysOffset(-1),
      });
      let returnedMsrp = applyDiscounts(data, 100, [earlyPayDiscount], cornProduct, cp);

      expect(data.discounts[earlyPayDiscount.id].value).not.toEqual('2%');
      expect(data.discounts[earlyPayDiscount.id].value).toEqual('1%');
      expect(returnedMsrp).toEqual(99);
    });

    it('with an order total of 100 and a day in the future, should use the 3rd discount detail', () => {
      const tomorrowDate = getDateWithDaysOffset(1.5);
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        orderQty: 1,
        discounts: [{ order: 0, DiscountId: earlyPayDiscount.id }],
        orderDate: tomorrowDate,
      });
      let returnedMsrp = applyDiscounts(data, 100, [earlyPayDiscount], cornProduct, cp);

      expect(data.discounts[earlyPayDiscount.id].value).toEqual('$100');
      expect(returnedMsrp).toEqual(0);
    });

    it('with a date too far in the future, sould not use this discount', () => {
      const futureDate = getDateWithDaysOffset(3);
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        orderQty: 1,
        discounts: [{ order: 0, DiscountId: earlyPayDiscount.id }],
        orderDate: futureDate,
      });
      let returnedMsrp = applyDiscounts(data, 100, [earlyPayDiscount], cornProduct, cp);

      expect(data.discounts[earlyPayDiscount.id].value).toEqual('');
      expect(returnedMsrp).toEqual(100);
    });
  });

  describe('Quantity Discount', () => {
    it('with a quantity of 1 should use the first detail with the correct discount amount', () => {
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        orderQty: 1,
        discounts: [{ order: 0, DiscountId: quantityDiscount.id }],
      });
      let returnedMsrp = applyDiscounts(data, 100, [quantityDiscount], cornProduct, cp, null, null, null, null, [], {
        id: 1,
      });

      // expect(data.discounts[quantityDiscount.id]).toEqual({ value: '$10', amount: 10 })
      expect(data.discounts[quantityDiscount.id].value).toEqual('$10');
      expect(data.discounts[quantityDiscount.id].amount).toEqual(10);
      expect(returnedMsrp).toEqual(90);
    });

    it('with a quantity of 11 should use the second detail with the correct discount amount', () => {
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        orderQty: 11,
        discounts: [{ order: 0, DiscountId: quantityDiscount.id }],
      });
      let returnedMsrp = applyDiscounts(data, 100, [quantityDiscount], cornProduct, cp, null, null, null, null, [], {
        id: 1,
      });

      // expect(data.discounts[quantityDiscount.id]).toEqual({ value: '$15', amount: 165 })
      expect(data.discounts[quantityDiscount.id].value).toEqual('$15');
      expect(data.discounts[quantityDiscount.id].amount).toEqual(165);
      expect(returnedMsrp).toEqual(85);
    });

    it('with a quantity of 21 should use the second detail with the correct discount amount', () => {
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        orderQty: 21,
        discounts: [{ order: 0, DiscountId: quantityDiscount.id }],
      });
      let returnedMsrp = applyDiscounts(data, 100, [quantityDiscount], cornProduct, cp, null, null, null, null, [], {
        id: 1,
      });

      let amount = 21 * 100 * 0.1;
      // expect(data.discounts[quantityDiscount.id]).toEqual({ value: '10%', amount: amount })
      expect(data.discounts[quantityDiscount.id].value).toEqual('10%');
      expect(data.discounts[quantityDiscount.id].amount).toEqual(amount);
      expect(returnedMsrp).toEqual(90);
    });

    it('with a date too far in the future, sould not use this discount', () => {
      const futureDate = getDateWithDaysOffset(2);
      let data = {
        discounts: {},
      };

      let cp = Object.assign({}, customerProduct, {
        orderQty: 1,
        discounts: [{ order: 0, DiscountId: quantityDiscount.id }],
        orderDate: futureDate,
      });
      let returnedMsrp = applyDiscounts(data, 11, [quantityDiscount], cornProduct, cp, null, null, null, null, [], {
        id: 1,
      });

      expect(data.discounts[quantityDiscount.id]).toEqual(undefined);
      expect(returnedMsrp).toEqual(11);
    });
  });
});

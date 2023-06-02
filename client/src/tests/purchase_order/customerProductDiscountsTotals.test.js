import { customerProductDiscountsTotals, perWholeOrderDiscount } from '../../utilities/index';
import { orders, products, dealerDiscounts, vsmDiscount, editingProduct } from './setup/table_data';

describe('customerProductDiscountsTotals', () => {
  it('should calculate the correct totals for a singe detail', () => {
    let data = customerProductDiscountsTotals(orders[0], dealerDiscounts, products[0], null, null, null, orders, {
      id: 1,
    });
    expect(data.originalPrice).toEqual(5 * 289);
    expect(data.total).toEqual(1180.304);
    expect(data.discountAmount.toFixed(2)).toEqual('264.70');
  });

  it('should calculate the correct totals for a singe detail', () => {
    let data = customerProductDiscountsTotals(orders[2], dealerDiscounts, products[2], null, null, null, orders, {
      id: 1,
    });
    expect(data.originalPrice).toEqual(15 * 270);
    expect(data.total).toEqual(2690.16 + 570);
    expect(data.discountAmount.toFixed(2)).toEqual('789.84');
  });

  it('should calculate the correct totals for an entire order', () => {
    let totals = {
      subTotal: 0,
      quantity: 0,
    };

    orders.forEach((order, i) => {
      let data = customerProductDiscountsTotals(order, dealerDiscounts, products[i], null, null, null, orders, {
        id: 1,
      });
      totals.subTotal += data.total;
      totals.quantity += order.orderQty;
    });

    const { orderTotal, orderDiscountsAmount } = perWholeOrderDiscount(totals.subTotal, totals.quantity, [vsmDiscount]);

    expect(totals.subTotal.toFixed(2)).toEqual('324403.71');
    expect(totals.quantity).toEqual(1403);
    expect(orderTotal.toFixed(2)).toEqual('271089.71');
    expect(orderDiscountsAmount).toEqual(53314);
  });
});

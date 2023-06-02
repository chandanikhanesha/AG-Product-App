import { doesDiscountApply } from '../../utilities/index';
import { quantityDiscount, cornProduct, customerProduct } from './setup/data';

describe('doesDiscountApply', () => {
  it('should not apply if seed company does not match', () => {
    const discount = {
      ...quantityDiscount,
      seedCompanyIds: [1],
    };
    const product = {
      ...cornProduct,
      seedCompanyId: 2,
    };
    const result = doesDiscountApply(discount, product, customerProduct);
    expect(result).toEqual(false);
  });

  it('should apply if product has no seed company', () => {
    const discount = {
      ...quantityDiscount,
      seedCompanyIds: [1],
    };
    const result = doesDiscountApply(discount, cornProduct, customerProduct);
    expect(result).toEqual(true);
  });
});

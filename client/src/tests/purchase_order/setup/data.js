export const getDateWithDaysOffset = (days) => {
  let theDate = new Date();
  theDate.setDate(theDate.getDate() + days);
  return theDate;
};

export const quantityDiscount = {
  id: 1,
  productCategories: ['CORN', 'SOYBEAN', 'SORGHUM'],
  companyIds: [],
  name: 'quantity',
  lastDate: getDateWithDaysOffset(1),
  discountStrategy: 'Quantity Discount',
  detail: [
    { unit: '$', maxQty: '10', minQty: '1', discountValue: '10' },
    { unit: '$', maxQty: '20', minQty: 11, discountValue: '15' },
    { unit: '%', maxQty: '30', minQty: 21, discountValue: '10' },
  ],
  applyToWholeOrder: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:37:56.466Z',
  updatedAt: '2018-11-23T02:37:56.466Z',
};

export const dollarVolumeDiscount = {
  id: 2,
  productCategories: ['CORN', 'SOYBEAN', 'SORGHUM'],
  companyIds: [],
  name: 'dollar volume',
  lastDate: getDateWithDaysOffset(1),
  discountStrategy: 'Dollar Volume Discount',
  detail: [
    { unit: '$', maxDollars: '100', minDollars: '1', discountValue: '20' },
    { unit: '$', maxDollars: '200', minDollars: 101, discountValue: '30' },
    { unit: '%', maxDollars: '300', minDollars: 201, discountValue: '15' },
  ],
  applyToWholeOrder: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:39:00.051Z',
  updatedAt: '2018-11-23T02:39:00.051Z',
};

export const earlyPayDiscount = {
  id: 3,
  productCategories: ['SOYBEAN', 'CORN', 'SORGHUM'],
  companyIds: [],
  name: 'early pay',
  lastDate: getDateWithDaysOffset(10),
  discountStrategy: 'Early Pay Discount',
  detail: [
    { date: getDateWithDaysOffset(-1), unit: '%', discountValue: '2' },
    { date: getDateWithDaysOffset(1), unit: '%', discountValue: '1' },
    { date: getDateWithDaysOffset(2), unit: '$', discountValue: '100' },
  ],
  applyToWholeOrder: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:40:22.422Z',
  updatedAt: '2018-11-23T02:40:22.422Z',
};

export const flatAmountDiscount = {
  id: 4,
  productCategories: ['SOYBEAN', 'CORN', 'SORGHUM'],
  companyIds: [],
  name: 'flat amount',
  lastDate: getDateWithDaysOffset(1),
  discountStrategy: 'Flat Amount Discount',
  detail: [{ unit: '$', discountValue: '307' }],
  applyToWholeOrder: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:40:52.946Z',
  updatedAt: '2018-11-23T02:40:52.946Z',
};

export const cornProduct = {
  id: 1,
  seedType: 'CORN',
  brand: 'SS',
  blend: 'DKC50-63RIB',
  seedSize: 'AF',
  treatment: 'BAS500',
  quantity: 72,
  msrp: '276',
  amountPerBag: '80M',
  packagingId: 1,
  organizationId: 1,
  createdAt: '2018-11-21T18:51:01.537Z',
  updatedAt: '2018-11-21T18:51:02.072Z',
};
export const customerProduct = {
  id: 39,
  customerId: 12,
  productId: 1,
  purchaseOrderId: 12,
  orderQty: 54,
  amountDelivered: null,
  discounts: null,
  organizationId: 1,
  farmId: null,
  fieldName: null,
  shareholderData: [],
  createdAt: '2018-11-21T18:51:01.807Z',
  updatedAt: '2018-11-21T18:51:01.972Z',
};

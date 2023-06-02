/**
 * Data below taken from a spreadsheet at :
 * https://docs.google.com/spreadsheets/d/1DujlNxDLYCMoZ9znUokaQ5hBsKTt3w9Kcv5rSOuL7hg
 */

import { getDateWithDaysOffset } from './data';

const monsantoStandardFlatDiscount = {
  id: 1,
  productCategories: ['SOYBEAH', 'CORN', 'SORGHUM'],
  companyIds: [],
  name: 'Bayer 12% Standard Flat',
  lastDate: getDateWithDaysOffset(1),
  discountStrategy: 'Flat Amount Discount',
  detail: [{ unit: '%', discountValue: '12' }],
  applyToWholeOrder: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:40:52.946Z',
  updatedAt: '2018-11-23T02:40:52.946Z',
};

const earlyPayFlat = {
  id: 2,
  productCategories: ['SOYBEAH', 'CORN', 'SORGHUM'],
  companyIds: [],
  name: 'Early Pay Flat',
  lastDate: getDateWithDaysOffset(10),
  discountStrategy: 'Early Pay Discount',
  detail: [
    { date: getDateWithDaysOffset(1), unit: '%', discountValue: '6' },
    { date: getDateWithDaysOffset(3), unit: '%', discountValue: '4' },
    { date: getDateWithDaysOffset(5), unit: '%', discountValue: '2' },
  ],
  applyToWholeOrder: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:40:22.422Z',
  updatedAt: '2018-11-23T02:40:22.422Z',
};

const cornLoyaltyFlatDiscount = {
  id: 3,
  productCategories: ['SOYBEAH', 'CORN', 'SORGHUM'],
  companyIds: [],
  name: 'Corn Loyalty Flat',
  lastDate: getDateWithDaysOffset(1),
  discountStrategy: 'Flat Amount Discount',
  detail: [{ unit: '$', discountValue: '3' }],
  applyToWholeOrder: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:40:52.946Z',
  updatedAt: '2018-11-23T02:40:52.946Z',
};

const dealerQuantityDiscount = {
  id: 4,
  productCategories: ['CORN', 'SORGHUM', 'SOYBEAH'],
  companyIds: [],
  name: 'Dealer quantity (per product)',
  lastDate: getDateWithDaysOffset(1),
  discountStrategy: 'Quantity Discount',
  detail: [
    { unit: '$', maxQty: '10', minQty: '0', discountValue: '0' },
    { unit: '$', maxQty: '20', minQty: 11, discountValue: '3' },
    { unit: '$', maxQty: '30', minQty: 21, discountValue: '4' },
    { unit: '$', maxQty: '40', minQty: 31, discountValue: '5' },
    { unit: '$', maxQty: '50', minQty: 41, discountValue: '6' },
    { unit: '$', maxQty: '60', minQty: 51, discountValue: '7' },
    { unit: '$', maxQty: '70', minQty: 61, discountValue: '8' },
    { unit: '$', maxQty: '80', minQty: 71, discountValue: '9' },
    { unit: '$', maxQty: '100', minQty: 81, discountValue: '10' },
    { unit: '$', maxQty: '150', minQty: 101, discountValue: '11' },
    { unit: '$', maxQty: '200', minQty: 151, discountValue: '12' },
    { unit: '$', maxQty: '9999999', minQty: 201, discountValue: '13' },
  ],
  applyToWholeOrder: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:37:56.466Z',
  updatedAt: '2018-11-23T02:37:56.466Z',
};

export const vsmDiscount = {
  id: 5,
  productCategories: ['CORN', 'SORGHUM', 'SOYBEAH'],
  companyIds: [],
  name: 'Dealer quantity (per product)',
  lastDate: getDateWithDaysOffset(1),
  discountStrategy: 'Quantity Discount',
  detail: [
    { unit: '$', maxQty: '49', minQty: '0', discountValue: '0' },
    { unit: '$', maxQty: '100', minQty: 50, discountValue: '8' },
    { unit: '$', maxQty: '200', minQty: 101, discountValue: '12' },
    { unit: '$', maxQty: '300', minQty: 201, discountValue: '16' },
    { unit: '$', maxQty: '400', minQty: 301, discountValue: '20' },
    { unit: '$', maxQty: '500', minQty: 401, discountValue: '23' },
    { unit: '$', maxQty: '600', minQty: 501, discountValue: '26' },
    { unit: '$', maxQty: '700', minQty: 601, discountValue: '28' },
    { unit: '$', maxQty: '800', minQty: 701, discountValue: '32' },
    { unit: '$', maxQty: '900', minQty: 801, discountValue: '34' },
    { unit: '$', maxQty: '1000', minQty: 901, discountValue: '36' },
    { unit: '$', maxQty: '9999999', minQty: 1001, discountValue: '38' },
  ],
  applyToWholeOrder: true,
  applyAsOverAllTotal: false,
  organizationId: 1,
  createdAt: '2018-11-23T02:37:56.466Z',
  updatedAt: '2018-11-23T02:37:56.466Z',
};

export const dealerDiscounts = [
  monsantoStandardFlatDiscount,
  earlyPayFlat,
  cornLoyaltyFlatDiscount,
  dealerQuantityDiscount,
  vsmDiscount,
];

export const products = [
  {
    id: 1,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '289',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 2,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '331',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 3,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '270',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 4,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '286',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  // { "id": 5, "seedType": "CORN", "brand": "SS", "blend": "DKC50-63RIB", "seedSize": "AF", "treatment": "BAS500", "quantity": 72, "msrp": "276", "amountPerBag": "80M", "packagingId": 1, "organizationId": 1, "createdAt": "2018-11-21T18:51:01.537Z", "updatedAt": "2018-11-21T18:51:02.072Z" },
  {
    id: 5,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '252',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 6,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '256',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 7,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '302',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 8,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '264',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 9,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '341',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 10,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '308',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 11,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '285',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 12,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '311',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 13,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '328',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 14,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '291',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 15,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '291',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 16,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '291',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
  {
    id: 17,
    seedType: 'CORN',
    brand: 'SS',
    blend: 'DKC50-63RIB',
    seedSize: 'AF',
    treatment: 'BAS500',
    quantity: 72,
    msrp: '291',
    amountPerBag: '80M',
    packagingId: 1,
    organizationId: 1,
    createdAt: '2018-11-21T18:51:01.537Z',
    updatedAt: '2018-11-21T18:51:02.072Z',
  },
];

const discounts = [
  { order: 0, DiscountId: 1 },
  { order: 1, DiscountId: 2 },
  { order: 2, DiscountId: 3 },
  { order: 3, DiscountId: 4 },
  { order: 4, DiscountId: 5 },
];

export const orders = [
  {
    id: 1,
    customerId: 12,
    productId: 1,
    purchaseOrderId: 12,
    orderQty: 5,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 2,
    customerId: 12,
    productId: 2,
    purchaseOrderId: 10,
    orderQty: 10,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 3,
    customerId: 12,
    productId: 3,
    purchaseOrderId: 10,
    orderQty: 15,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 4,
    customerId: 12,
    productId: 4,
    purchaseOrderId: 10,
    orderQty: 20,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 5,
    customerId: 12,
    productId: 5,
    purchaseOrderId: 10,
    orderQty: 30,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 6,
    customerId: 12,
    productId: 6,
    purchaseOrderId: 10,
    orderQty: 35,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 7,
    customerId: 12,
    productId: 7,
    purchaseOrderId: 10,
    orderQty: 40,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 8,
    customerId: 12,
    productId: 8,
    purchaseOrderId: 10,
    orderQty: 45,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 9,
    customerId: 12,
    productId: 9,
    purchaseOrderId: 10,
    orderQty: 43,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 10,
    customerId: 12,
    productId: 10,
    purchaseOrderId: 10,
    orderQty: 60,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 11,
    customerId: 12,
    productId: 11,
    purchaseOrderId: 10,
    orderQty: 75,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 12,
    customerId: 12,
    productId: 12,
    purchaseOrderId: 10,
    orderQty: 100,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 13,
    customerId: 12,
    productId: 13,
    purchaseOrderId: 10,
    orderQty: 125,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 14,
    customerId: 12,
    productId: 14,
    purchaseOrderId: 10,
    orderQty: 200,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 15,
    customerId: 12,
    productId: 15,
    purchaseOrderId: 10,
    orderQty: 200,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 16,
    customerId: 12,
    productId: 16,
    purchaseOrderId: 10,
    orderQty: 200,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
  {
    id: 17,
    customerId: 12,
    productId: 17,
    purchaseOrderId: 10,
    orderQty: 200,
    amountDelivered: null,
    discounts: discounts,
    organizationId: 1,
    farmId: null,
    fieldName: null,
    shareholderData: [],
    createdAt: '2018-11-21T18:51:01.807Z',
    updatedAt: '2018-11-21T18:51:01.972Z',
    CustomerCustomProducts: [],
  },
];
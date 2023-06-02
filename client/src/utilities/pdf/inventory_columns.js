import { getQtyOrdered, getQtyShipped, getGrowerOrder, getGrowerOrderDelivered } from '../product';

export default function (customerProducts, deliveryReceiptDetails, productType) {
  const columns = {
    custom: [
      {
        header: 'Product',
        dataKey: 'name',
        width: 16,
      },
      {
        header: 'Type',
        dataKey: 'type',
        width: 16,
      },
      {
        header: 'Description',
        dataKey: 'description',
        width: 16,
      },
      {
        header: 'ID',
        dataKey: 'customId',
        with: 16,
      },
      {
        header: 'Unit',
        dataKey: 'unit',
        width: 16,
      },
      {
        header: 'Cost per unit',
        dataKey: 'costUnit',
        width: 25,
      },
      {
        header: 'Quantity',
        dataKey: 'quantity',
        width: 16,
      },
    ],
    corn: [
      {
        header: 'Trait',
        dataKey: 'brand',
        width: 17,
      },
      {
        header: 'Variety',
        dataKey: 'blend',
        width: 26,
      },
      {
        header: 'Treatment',
        dataKey: 'treatment',
        width: 20,
      },
      {
        header: 'MSRP',
        dataKey: 'msrp',
        width: 15,
      },
      {
        header: 'Dealer Order',
        dataKey: 'dealerOrder',
        accessor: (d) => getQtyOrdered(d),
        width: 16,
      },
      {
        header: 'Qty shipped from seed company',
        dataKey: 'qtyShippedFromSeedCompany',
        accessor: (d) => getQtyShipped(d),
        width: 24,
      },
      {
        header: 'Qty yet to ship from seed company',
        dataKey: 'qtyYetToShipFromSeedCompany',
        accessor: (d) => getQtyOrdered(d) - getQtyShipped(d),
        width: 29,
      },
      {
        header: 'Grower Order',
        dataKey: 'growerOrder',
        accessor: (d) => getGrowerOrder(d, customerProducts),
        width: 18,
      },
      {
        header: 'Grower Order Delivered',
        dataKey: 'growerOrderDelivered',
        accessor: (d) => getGrowerOrderDelivered(d, deliveryReceiptDetails),
        width: 21,
      },
      {
        header: 'Grower Order Yet to Deliver',
        dataKey: 'growerOrderYetToDeliver',
        accessor: (d) =>
          customerProducts
            .filter((order) => order.productId === d.id)
            .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0),
        width: 28,
      },
      {
        header: 'Long / Short',
        dataKey: 'longShort',
        accessor: (d) => getQtyOrdered(d) - getGrowerOrder(d, customerProducts),
        width: 25,
      },
      {
        header: 'Qty at Warehouse',
        dataKey: 'qtyAtWareHouse',
        accessor: (d) => getQtyShipped(d) - getGrowerOrderDelivered(d, deliveryReceiptDetails),
        width: 25,
      },
    ],
    sorghum: [
      {
        header: 'Variety',
        dataKey: 'blend',
        width: 22,
      },
      {
        header: 'Treatment',
        dataKey: 'treatment',
        width: 22,
      },
      {
        header: 'MSRP',
        dataKey: 'msrp',
        width: 16,
      },
      {
        header: 'Dealer Order',
        dataKey: 'dealerOrder',
        accessor: (d) => getQtyOrdered(d),
        width: 16,
      },
      {
        header: 'Qty shipped from seed company',
        dataKey: 'qtyShippedFromSeedCompany',
        accessor: (d) => getQtyShipped(d),
        width: 26,
      },
      {
        header: 'Qty yet to ship from seed company',
        dataKey: 'qtyYetToShipFromSeedCompany',
        accessor: (d) => getQtyOrdered(d) - getQtyShipped(d),
        width: 29,
      },
      {
        header: 'Grower Order',
        dataKey: 'growerOrder',
        accessor: (d) => getGrowerOrder(d, customerProducts),
        width: 18,
      },
      {
        header: 'Grower Order Delivered',
        dataKey: 'growerOrderDelivered',
        accessor: (d) => getGrowerOrderDelivered(d, deliveryReceiptDetails),
        width: 21,
      },
      {
        header: 'Grower Order Yet to Deliver',
        dataKey: 'growerOrderYetToDeliver',
        accessor: (d) =>
          customerProducts
            .filter((order) => order.productId === d.id)
            .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0),
        width: 28,
      },
      {
        header: 'Long / Short',
        dataKey: 'longShort',
        accessor: (d) => getQtyOrdered(d) - getGrowerOrder(d, customerProducts),
        width: 25,
      },
      {
        header: 'Qty at Warehouse',
        dataKey: 'qtyAtWareHouse',
        accessor: (d) => getQtyShipped(d) - getGrowerOrderDelivered(d, deliveryReceiptDetails),
        width: 25,
      },
    ],
    soybean: [
      {
        header: 'Trait',
        dataKey: 'brand',
        width: 16,
      },
      {
        header: 'Variety',
        dataKey: 'blend',
        width: 22,
      },
      {
        header: 'Treatment',
        dataKey: 'treatment',
        width: 22,
      },
      {
        header: 'MSRP',
        dataKey: 'msrp',
        width: 16,
      },
      {
        header: 'Dealer Order',
        dataKey: 'dealerOrder',
        accessor: (d) => getQtyOrdered(d),
        width: 16,
      },
      {
        header: 'Qty shipped from seed company',
        dataKey: 'qtyShippedFromSeedCompany',
        accessor: (d) => getQtyShipped(d),
        width: 26,
      },
      {
        header: 'Qty yet to ship from seed company',
        dataKey: 'qtyYetToShipFromSeedCompany',
        accessor: (d) => getQtyOrdered(d) - getQtyShipped(d),
        width: 29,
      },
      {
        header: 'Grower Order',
        dataKey: 'growerOrder',
        accessor: (d) => getGrowerOrder(d, customerProducts),
        width: 18,
      },
      {
        header: 'Grower Order Delivered',
        dataKey: 'growerOrderDelivered',
        accessor: (d) => getGrowerOrderDelivered(d, deliveryReceiptDetails),
        width: 21,
      },
      {
        header: 'Grower Order Yet to Deliver',
        dataKey: 'growerOrderYetToDeliver',
        accessor: (d) =>
          customerProducts
            .filter((order) => order.productId === d.id)
            .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0),
        width: 28,
      },
      {
        header: 'Long / Short',
        dataKey: 'longShort',
        accessor: (d) => getQtyOrdered(d) - getGrowerOrder(d, customerProducts),
        width: 25,
      },
      {
        header: 'Qty at Warehouse',
        dataKey: 'qtyAtWareHouse',
        accessor: (d) => getQtyShipped(d) - getGrowerOrderDelivered(d, deliveryReceiptDetails),
        width: 25,
      },
    ],
  };
  return columns[productType];
}

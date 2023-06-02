import { format } from 'date-fns';

export default function () {
  return [
    {
      header: 'Trait',
      dataKey: 'brand',
    },
    {
      header: 'Variety',
      dataKey: 'blend',
    },
    {
      header: 'Treatment',
      dataKey: 'treatment',
    },
    {
      header: 'MSRP',
      dataKey: 'msrp',
    },
    {
      header: 'Transfer IN/OUT',
      dataKey: 'transfer',
    },
    {
      header: 'Dealer Name',
      accessor: (d) => d.transferInfo.seedDealerName,
      dataKey: 'seedDealerName',
    },
    {
      header: 'Dealer ID',
      accessor: (d) => d.transferInfo.seedDealerId,
      dataKey: 'seedDealerId',
    },
    {
      header: 'Dealer Addr',
      accessor: (d) => d.transferInfo.seedDealerAddress,
      dataKey: 'seedDealerAddress',
    },
    {
      header: 'Date',
      dataKey: 'seedDealerTransferDate',
      accessor: (d) => format(d.transferInfo.seedDealerTransferDate, 'MMM Do, YYYY'),
    },
    {
      header: 'Quantity',
      dataKey: 'orderAmount',
    },
  ];
}

import React, { Component } from 'react';
import ReactTable from 'react-table';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';

import { numberToDollars } from '../../utilities';
import { getFutureDiscountTotals, getOrderSummary, getOrderTotals } from '../../utilities/purchase_order';

const styles = {
  date: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  earlyCash: {
    marginRight: 10,
  },
  payLess: {
    background: '#e0e0e0',
    border: '1px solid #c7c7c7',
    borderRadius: 5,
    padding: '2px 5px',
  },
  earlyPayTable: {
    border: '1px solid gray',
    marginBottom: 20,
  },
  mrspWithDiscount: {
    fontWeight: 'bold',
    marginLeft: 10,
  },
};

class EarlyPayTable extends Component {
  getPaymentsTotal() {
    const { payments, selectedShareholder, purchaseOrder } = this.props;
    return payments
      .filter((payment) => payment.purchaseOrderId === purchaseOrder.id)
      .filter((payment) => {
        if (selectedShareholder) {
          return payment.shareholderId === selectedShareholder.id;
        } else {
          return true;
        }
      })
      .reduce((total, payment) => {
        return total + parseFloat(payment.amount);
      }, 0);
  }
  get earlyPayColumns() {
    const { products, customProducts, dealerDiscounts, purchaseOrder, selectedShareholder } = this.props;
    const orderTotals = getOrderTotals({
      customerOrders: this.getCustomerOrders(),
      shareholder: selectedShareholder,
      purchaseOrder,
      products,
      customProducts,
      dealerDiscounts,
    });

    const [mrspWithDiscount] = getOrderSummary({
      discountTotals: orderTotals,
      dealerDiscounts,
      convertToDollar: false,
    }).reverse();

    return [
      {
        Header: 'PAY BY',
        accessor: 'payBy',
      },
      {
        Header: 'Paying less',
        accessor: 'payingLess',
      },
      {
        Header: 'Remaining Total',
        accessor: 'remainingTotal',
      },
      {
        Header: 'Pending Payment',
        accessor: 'pendingPayment',
      },
      {
        Header: numberToDollars(mrspWithDiscount - this.getPaymentsTotal()),
        accessor: 'paymentsTotal',
        headerStyle: {
          textAlign: 'center',
          fontWeight: 'bold',
        },
      },
    ];
  }

  getCustomerOrders() {
    const { customerProducts, customer, purchaseOrder, customerCustomProducts } = this.props;
    const filterByCustomer = (product) => product.customerId === customer.id;
    let orders = customerProducts.filter(filterByCustomer);
    let customOrders = customerCustomProducts.filter(filterByCustomer);
    return [...orders, ...customOrders].filter((orders) => orders.purchaseOrderId === purchaseOrder.id);
  }

  get earlyPayTableData() {
    const { dealerDiscounts, purchaseOrder, products, customProducts, classes, selectedShareholder } = this.props;

    let rows = [];

    const customerOrders = this.getCustomerOrders();

    const futureDiscountTotals = getFutureDiscountTotals({
      customerOrders,
      shareholder: selectedShareholder,
      dealerDiscounts,
      purchaseOrder,
      products,
      customProducts,
    });

    Object.keys(futureDiscountTotals).forEach((date) => {
      let discountTotals = futureDiscountTotals[date];
      const [mrspWithDiscount, msrp, totalDiscount] = getOrderSummary({ discountTotals, dealerDiscounts }).reverse();
      if (msrp && msrp !== '$0.00') {
        rows.push({
          payBy: (
            <div>
              <span className={classes.date}>{format(date, 'MM/DD/YY')}</span>
            </div>
          ),
          payingLess: (
            <div>
              <span className={classes.payLess}>Pay {totalDiscount} less</span>
            </div>
          ),
          remainingTotal: (
            <div>
              <span className={classes.mrspWithDiscount}>{mrspWithDiscount}</span>
            </div>
          ),
        });
      }
    });

    return rows;
  }

  render() {
    return (
      this.earlyPayTableData.length > 0 && (
        <ReactTable
          sortable={false}
          showPagination={false}
          minRows={1}
          NoDataComponent={() => null}
          columns={this.earlyPayColumns}
          data={this.earlyPayTableData}
          className={this.props.classes.earlyPayTable}
        />
      )
    );
  }
}

export default withStyles(styles)(EarlyPayTable);

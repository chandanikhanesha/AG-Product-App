import React, { Component } from 'react';
import ReactTable from 'react-table';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';

import { numberToDollars } from '../../../utilities';
import { getOrderSummary, getOrderTotals } from '../../../utilities/purchase_order';

import { earlyPayTableStyles } from './early_pay_table.styles';
import moment from 'moment';

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
      purchaseOrder.isQuote
        ? {}
        : {
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
    const { purchaseOrder, classes } = this.props;

    let rows = [];
    const { CustomEarlyPays } = purchaseOrder;

    CustomEarlyPays.forEach((earlyPay) => {
      rows.push({
        payBy: (
          <div>
            <span className={classes.date}>{moment.utc(earlyPay.payByDate).format('MM/DD/YY')}</span>
          </div>
        ),
        payingLess: (
          <div>
            <span className={classes.payLess}>Pay {numberToDollars(earlyPay.payingLessAmount)} less</span>
          </div>
        ),
        remainingTotal: (
          <div>
            <span className={classes.mrspWithDiscount}>{numberToDollars(earlyPay.remainingTotal)}</span>
          </div>
        ),
      });
    });

    return rows;
  }

  render() {
    return (
      this.earlyPayTableData.length > 0 && (
        <div className="invoice-table-wrapper">
          <h4>Early Pay</h4>
          <ReactTable
            sortable={false}
            showPagination={false}
            minRows={1}
            NoDataComponent={() => null}
            columns={this.earlyPayColumns}
            data={this.earlyPayTableData}
            className={this.props.classes.earlyPayTable}
            getTheadTrProps={() => {
              return {
                style: {
                  color: '#3C4858',
                  background: '#CDDFC8',
                  fontWeight: 'bold',
                },
              };
            }}
          />
        </div>
      )
    );
  }
}

export default withStyles(earlyPayTableStyles)(EarlyPayTable);

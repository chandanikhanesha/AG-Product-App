import React, { Component } from 'react';
import ReactTable from 'react-table';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';

import { numberToDollars } from '../../../utilities';
import { getFutureDiscountTotals, getOrderSummary, getOrderTotals } from '../../../utilities/purchase_order';

import { earlyPayTableStyles } from './early_pay_table.styles';

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
        headerStyle: { fontSize: this.props.selectedFontSize },
      },
      {
        Header: 'Paying less',
        accessor: 'payingLess',
        headerStyle: { fontSize: this.props.selectedFontSize },
      },
      {
        Header: 'Remaining Total',
        accessor: 'remainingTotal',
        headerStyle: { fontSize: this.props.selectedFontSize },
      },
      purchaseOrder.isQuote
        ? {}
        : {
            Header: 'Pending Payment',
            accessor: 'pendingPayment',
            headerStyle: { fontSize: this.props.selectedFontSize },
          },
      {
        Header: numberToDollars(mrspWithDiscount - this.getPaymentsTotal()),
        accessor: 'paymentsTotal',
        headerStyle: {
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: this.props.selectedFontSize,
        },
      },
    ];
  }

  getCustomerOrders() {
    const { customerProducts, customer, purchaseOrder, customerCustomProducts, customerMonsantoProduct } = this.props;
    const filterByCustomer = (product) => product.customerId === customer.id;
    let orders = customerProducts ? customerProducts.filter(filterByCustomer) : [];
    let customOrders = customerCustomProducts ? customerCustomProducts.filter(filterByCustomer) : [];
    return [...orders, ...customOrders, ...customerMonsantoProduct].filter(
      (orders) => orders.purchaseOrderId === purchaseOrder.id,
    );
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

    Object.keys(futureDiscountTotals)
      .sort()
      .forEach((date) => {
        let discountTotals = futureDiscountTotals[date];
        const [mrspWithDiscount, msrp, totalDiscount] = getOrderSummary({
          discountTotals,
          dealerDiscounts,
        }).reverse();
        let pastClass = date < new Date().toISOString() ? classes.pastClass : '';
        if (msrp && msrp !== '$0.00') {
          rows.push({
            payBy: (
              <div>
                <span className={`${classes.date} ${pastClass}`}>{format(date, 'MM/DD/YY')}</span>
              </div>
            ),
            payingLess: (
              <div>
                <span className={`${classes.payLess} ${pastClass}`}>Pay {totalDiscount} less</span>
              </div>
            ),
            remainingTotal: (
              <div>
                <span className={`${classes.mrspWithDiscount} ${pastClass}`}>{mrspWithDiscount}</span>
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
        <div className="invoice-table-wrapper" style={{ fontSize: this.props.selectedFontSize }}>
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
                  fontSize: this.props.selectedFontSize,
                },
              };
            }}
            getTrProps={(state, rowInfo) => {
              return { style: { fontSize: this.props.selectedFontSize } };
            }}
          />
        </div>
      )
    );
  }
}

export default withStyles(earlyPayTableStyles)(EarlyPayTable);
